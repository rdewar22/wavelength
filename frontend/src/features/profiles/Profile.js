import './Profile.css'
import React, { useState, useEffect } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import UploadAvatar from "./UploadAvatar";
import UploadAudio from "./UploadAudio";
import { selectCurrentUser, selectCurrentUserId } from "../auth/authSlice";
import { useSelector } from "react-redux";
import { useGetPostsByUserNameQuery } from '../posts/postsApiSlice';
import { selectAudiosByUser, useGetAudiosByUserIdQuery } from '../audio/audioApiSlice';
import PostsExcerpt from '../posts/PostsExcerpt';
import { Spinner } from 'reactstrap';

const Profile = ({ token }) => {
  const userName = useSelector(selectCurrentUser);
  const userId = useSelector(selectCurrentUserId);
  const [isProfPic, setProfPic] = useState(true);
  const [isProfPicLoading, setIsProfPicLoading] = useState(true);
  const profilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${userName}_profPic.jpeg`
  const imageSrc = profilePicUri + "?" + Math.random().toString(36);
  const [counter, setCounter] = useState(0);

  // Fetch posts
  const {
    data: posts,
    isLoading: isPostsLoading,
    isSuccess: isPostsSuccess,
    isError: isPostsError,
    error: postsError
  } = useGetPostsByUserNameQuery(userName)

  // Fetch audios - make sure we have a userId before fetching
  const {
    data: audiosData,
    isLoading: isAudiosLoading,
    isSuccess: isAudiosSuccess,
    isError: isAudiosError,
    error: audiosError
  } = useGetAudiosByUserIdQuery(userId, {
    skip: !userId // Skip the query if we don't have a userId
  })

  // Get audios using the selector
  const audios = useSelector(state => userId ? selectAudiosByUser(state, userId) : []);

  let postsContent;
  if (isPostsLoading) {
    postsContent = <p>"Loading..."</p>;
  } else if (isPostsSuccess) {
    postsContent = [...(posts?.ids || [])].reverse().map(postId => <PostsExcerpt key={postId} postId={postId} />);
  } else if (isPostsError) {
    postsContent = <p>Error: {postsError?.originalStatus} {postsError?.status}</p>
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
                    style={{ display: isPostsLoading ? 'none' : 'block' }}
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
              buttonLabel="Upload New Audio"
            />
          </div>
          <div className="audio-list">
            {isAudiosLoading ? (
              <Spinner />
            ) : isAudiosError ? (
              <p>Error loading audio files: {audiosError?.message}</p>
            ) : audios?.length > 0 ? (
              audios.map((audio) => (
                <div key={audio._id} className="audio-item">
                  <div className="audio-item-header">
                    <p>{audio.title || `Audio ${audio._id}`}</p>
                    <span className="audio-timestamp">{formatDate(audio.date)}</span>
                  </div>
                  <audio controls preload="metadata">
                    <source src={audio.url} type="audio/mpeg" />
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
          {postsContent}
        </div>
      </div>
    </>
  );
};

export default Profile;