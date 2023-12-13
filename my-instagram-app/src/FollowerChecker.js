import React, { useState } from 'react';
import styles from './FollowerChecker.module.css';

function FollowerChecker() {
    const [followersFile, setFollowersFile] = useState(null);
    const [followingFile, setFollowingFile] = useState(null);
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFollowersFileChange = (e) => {
        setFollowersFile(e.target.files[0]);
    };

    const handleFollowingFileChange = (e) => {
        setFollowingFile(e.target.files[0]);
    };

    const handleCompare = async () => {
        if (!followersFile || !followingFile) {
            alert("Please upload both files.");
            return;
        }

        setIsLoading(true); 
        const formData = new FormData();
        formData.append('files', followersFile);
        formData.append('files', followingFile);

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Artificial delay for testing 2 seconds
            //await new Promise(resolve => setTimeout(resolve, 2000));

            const data = await response.json();
            setResult(data.notFollowedBack.map(username => (
                <div key={username} className={styles.centerText}>
                    <a href={`https://www.instagram.com/${username}`} target="_blank" rel="noopener noreferrer">
                        {username}
                    </a>
                </div>
            )));
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className={styles.centerText}>Instagram Follower Checker</h1>
            <input type="file" onChange={handleFollowersFileChange} accept=".json" />
            <input type="file" onChange={handleFollowingFileChange} accept=".json" />
            <button onClick={handleCompare} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Compare'}
            </button>
            <div className={styles.resultsContainer}>
                {result}
            </div>
        </div>
    );
}

export default FollowerChecker;
