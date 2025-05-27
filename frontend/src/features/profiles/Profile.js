import './Profile.css'
import React, { useState, useEffect } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import UploadAvatar from "./UploadAvatar";
import UploadAudio from "./UploadAudio";
import { selectCurrentUser, selectisProfPicInDb } from "../auth/authSlice";
import { useSelector } from "react-redux";
import { useGetPostsByUserNameQuery, selectPostIds } from '../posts/postsApiSlice';
import PostsExcerpt from '../posts/PostsExcerpt';
import { Spinner } from 'reactstrap';

const Profile = ({ token }) => {
  const userName = useSelector(selectCurrentUser);
  const [isProfPic, setProfPic] = useState(true);
  const [isProfPicLoading, setIsProfPicLoading] = useState(true);
  const [audioUrls, setAudioUrls] = useState([]);
  const profilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${userName}_profPic.jpeg`
  const imageSrc = profilePicUri + "?" + Math.random().toString(36);
  const [counter, setCounter] = useState(0);

  const {
    data: posts,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetPostsByUserNameQuery(userName)

  const handleAudioUploaded = (audioUrl) => {
    // Ensure the URL is properly formatted for S3
    const formattedUrl = audioUrl.startsWith('http') 
      ? audioUrl 
      : `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/${audioUrl}`;
    setAudioUrls(prev => [...prev, {
      url: formattedUrl,
      timestamp: Date.now()
    }]);
  };

  let content;
  if (isLoading) {
    content = <p>"Loading..."</p>;
  } else if (isSuccess) {
    content = [...posts.ids].reverse().map(postId => <PostsExcerpt key={postId} postId={postId} />);
  } else if (isError) {
    content = <p>Error: {error.originalStatus} {error.status}</p>
  }

  const reloadParent = () => {
    setCounter(prev => prev + 1);
    setProfPic(true)
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <>
      <div className="profile">
        <div className='profile-page-header'>
          <div className="avatar">
            <div className="avatar-wrapper">
              {isProfPic ? (
                <>
                  {isProfPicLoading && <Spinner />}
                  <img
                    src={imageSrc}
                    alt={`${userName} avatar`}
                    onLoad={() => setIsProfPicLoading(false)}
                    onError={() => {
                      setProfPic(false);
                      setIsProfPicLoading(false);
                    }}
                    style={{ display: isLoading ? 'none' : 'block' }}
                  />
                </>
              ) : (
                <IoPersonCircleOutline size={40} />
              )}
              <UploadAvatar
                avatarUrl={profilePicUri}
                reloadParent={reloadParent}
              />
            </div>
          </div>
          <p className='profile-name'>{userName}</p>
        </div>

        <div className="audio-section">
          <h3>Audio Files</h3>
          <div className="audio-controls">
            <UploadAudio
              onAudioUploaded={handleAudioUploaded}
              buttonLabel="Upload New Audio"
            />
          </div>
          <div className="audio-list">
            {audioUrls.length > 0 ? (
              audioUrls.map((audio, index) => (
                <div key={audio.timestamp} className="audio-item">
                  <div className="audio-item-header">
                    <p>Audio {index + 1}</p>
                    <span className="audio-timestamp">{formatDate(audio.timestamp)}</span>
                  </div>
                  <audio controls preload="metadata">
                    <source src={audio.url} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ))
            ) : (
              <p className="no-audio">No audio files uploaded yet</p>
            )}
          </div>
        </div>

        <div className="body">
          {content}
        </div>
      </div>
    </>
  );
};

export default Profile;