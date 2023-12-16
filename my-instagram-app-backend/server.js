const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');
const fs = require('fs');
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({region: process.env.AWS_REGION || 'us-east-1'});

const app = express();
const corsOptions = {
    origin: 'https://follow-checker-ig-client.vercel.app'
};
app.use(cors(corsOptions));
app.use(express.json());

//const upload = multer({ dest: 'uploads/' });
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'cyclic-concerned-tam-dove-us-east-1',
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    })
});

app.get("/", (req,res) => {
    res.send("Server is running");
});

// app.post('/upload', upload.array('files', 2), (req, res) => {
//     if (req.files.length !== 2) {
//         return res.status(400).send('Please upload two files');
//     }

//     const [followersFile, followingFile] = req.files;

//     try {
//         const followersData = parseJsonFile(followersFile.path);
//         const followingData = parseJsonFile(followingFile.path);

//         const notFollowedBack = compareFollowers(followersData, followingData);

//         req.files.forEach(file => {
//             fs.unlinkSync(file.path);
//         });

//         res.json({ notFollowedBack });

//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error processing files');
//     }
// });

app.post('/upload', upload.array('files', 2), async (req, res) => {
    if (req.files.length !== 2) {
        return res.status(400).send('Please upload two files');
    }

    try {
        const followersData = await getFileContent(req.files[0].key);
        const followingData = await getFileContent(req.files[1].key);

        const notFollowedBack = compareFollowers(followersData, followingData);
        
        await Promise.all([
            deleteFileFromS3(req.files[0].key),
            deleteFileFromS3(req.files[1].key),
        ]);

        console.log(notFollowedBack);
        res.json({ notFollowedBack });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing files');
    }
});

async function getFileContent(key) {
    const params = {
        Bucket: 'cyclic-concerned-tam-dove-us-east-1',
        Key: key
    };

    try {
        const command = new GetObjectCommand(params);
        const data = await s3.send(command);
        const bodyContents = await streamToString(data.Body); // helper function to convert stream to string
        return JSON.parse(bodyContents);
    } catch (error) {
        console.error('Error getting file from S3:', error);
        throw error;
    }
}

async function deleteFileFromS3(key) {
    const params = {
        Bucket: 'cyclic-concerned-tam-dove-us-east-1',
        Key: key
    };

    try {
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        console.log(`File deleted: ${key}`);
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        throw error;
    }
}

function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
}

// const parseJsonFile = (filePath) => {
//     const rawData = fs.readFileSync(filePath);
//     return JSON.parse(rawData);
// };

const compareFollowers = (followers, following) => {
    const extractUsernames = (data) => data.flatMap(item => item.string_list_data.map(user => user.value.toLowerCase()));
    const followerUsernames = extractUsernames(followers);
    const followingUsernames = extractUsernames(following.relationships_following);
    return followingUsernames.filter(username => !followerUsernames.includes(username));
};

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
