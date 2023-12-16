//Imports
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

//Middleware
const app = express();
app.use(cors()); 
app.use(express.json());

//Routes
const upload = multer({ dest: 'uploads/' });
const PORT = 5000;

// Start server
app.use("/", (req, res) => {
    res.send("Server is running");
});

app.post('/upload', upload.array('files', 2), (req, res) => {
    if (req.files.length !== 2) {
        return res.status(400).send('Please upload two files');
    }

    const [followersFile, followingFile] = req.files;

    try {
        const followersData = parseJsonFile(followersFile.path);
        const followingData = parseJsonFile(followingFile.path);

        const notFollowedBack = compareFollowers(followersData, followingData);

        req.files.forEach(file => {
            fs.unlinkSync(file.path);
        });

        res.json({ notFollowedBack });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing files');
    }
});

const parseJsonFile = (filePath) => {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
};

const compareFollowers = (followers, following) => {
    const extractUsernames = (data) => data.flatMap(item => item.string_list_data.map(user => user.value.toLowerCase()));
    const followerUsernames = extractUsernames(followers);
    const followingUsernames = extractUsernames(following.relationships_following);
    return followingUsernames.filter(username => !followerUsernames.includes(username));
};


app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT + '.');
});
