import React, { useState } from 'react';
import { FaGithub} from 'react-icons/fa';
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
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const handleUserClick = (username) => {
              window.open(`https://www.instagram.com/${username}`, '_blank');
            };
            
            const data = await response.json();
            setResult(data.notFollowedBack.map(username => (
              <div key={username} className={styles.usernameItem} onClick={() => handleUserClick(username)}>
                <span className={styles.usernameText}>{username}</span>
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
      <>
        <div className={styles.container}>
        
        <nav className={styles.navbar}>
                <div className={styles.navIcons}>
                    <a href="https://github.com/skalidindi53" target="_blank" rel="noopener noreferrer">
                        <FaGithub size={50} />
                    </a>
                </div>
        </nav>
        
        <header className={styles.header}>
            <h1 className={styles.headerText}>Instagram Follower Checker</h1>
        </header>

            <div className={styles.buttonContainer}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <label htmlFor="followersInput" className={styles.uploadButton}>
                  Upload Followers
                  <input
                    id="followersInput"
                    type="file"
                    onChange={handleFollowersFileChange}
                    accept=".json"
                    className={styles.fileInput}
                  />
                </label>
      
                <label htmlFor="followingInput" className={styles.uploadButton}>
                  Upload Following
                  <input
                    id="followingInput"
                    type="file"
                    onChange={handleFollowingFileChange}
                    accept=".json"
                    className={styles.fileInput}
                  />
                </label>
              </div>
      
              <button onClick={handleCompare} disabled={isLoading} className={`${styles.uploadButton} ${styles.compareButton}`}>
                {isLoading ? 'Processing...' : 'Compare'}
              </button>

            </div>
      
          <div className={styles.resultsContainer}>
              {Array.isArray(result) && result.map(username => (
              <div>
                  <span className={styles.usernameText}>{username}</span>
              </div>
              ))}
          </div>

      </div>
    </>
    );

}

export default FollowerChecker;
