import './Profile.css'
import React, { useState, useEffect } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import UploadAvatar from "./UploadAvatar";
import UploadAudio from "./UploadAudio";
import { selectCurrentUser, selectCurrentUserId } from "../auth/authSlice";
import { useSelector } from "react-redux";
import { useGetPostsByUserIdQuery } from '../posts/postsApiSlice';
import { selectAudiosByUser, useGetAudiosByUserIdQuery } from '../audio/audioApiSlice';
import PostsExcerpt from '../posts/PostsExcerpt';
import { Spinner } from 'reactstrap';
import AudioExcerpt from '../audio/AudioExcerpt';

const Profile = ({ token }) => {
  const userName = useSelector(selectCurrentUser);
  const userId = useSelector(selectCurrentUserId);
  const user = useSelector(state => state.auth.user);
  const [isProfPic, setProfPic] = useState(true);
  const [isProfPicLoading, setIsProfPicLoading] = useState(true);

  // Use profile picture URL from Redux store (user object now has profilePicUri)
  const baseProfilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${userName}_profPic.jpeg`;
  const profilePicUri = user?.profilePicUri || baseProfilePicUri;

  const [counter, setCounter] = useState(0);

  // Use the profilePicUri from Redux (which now includes cache busting) or add counter for manual refresh
  const imageSrc = counter > 0
    ? `${baseProfilePicUri}?v=${counter}`
    : profilePicUri;

  // Fetch posts
  const {
    data: posts,
    isLoading: isPostsLoading,
    isSuccess: isPostsSuccess,
    isError: isPostsError,
    error: postsError
  } = useGetPostsByUserIdQuery(userId)

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


  let postsContent;
  if (isPostsLoading) {
    postsContent = <p>"Loading..."</p>;
  } else if (isPostsSuccess) {
    if (posts?.ids && posts.ids.length > 0) {
      postsContent = [...(posts?.ids || [])].reverse().map(postId => <PostsExcerpt key={postId} postId={postId} />);
    } else {
      postsContent = <p className="empty-state">No posts yet. Share your first post!</p>;
    }
  } else if (isPostsError) {
    postsContent = <p>Error: {postsError?.originalStatus} {postsError?.status}</p>
  }

  let audiosContent;
  if (isAudiosLoading) {
    audiosContent = <p>"Loading..."</p>;
  } else if (isAudiosSuccess) {
    if (audiosData?.ids && audiosData.ids.length > 0) {
      audiosContent = (audiosData?.ids || []).slice().reverse().map(data => <AudioExcerpt key={data} audioId={data} />);
    } else {
      audiosContent = <p className="empty-state">No audio files uploaded yet. Upload your first audio!</p>;
    }
  } else if (isAudiosError) {
    audiosContent = <p>Error: {audiosError?.originalStatus} {audiosError?.status}</p>
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
          <div className='profile-name'>{userName}</div>
        </div>

        <div className="content-sections">

          <div className="posts-section">
            <div className="body">
              <h2>Posts</h2>
              {postsContent}
            </div>
          </div>
          <div className="audio-section">
            <h3>Audio Files</h3>
            <div className="audio-controls">
              <UploadAudio
                buttonLabel="Upload New Audio"
              />
            </div>
            <div className="audio-list">
              {audiosContent || <p>No audio files uploaded yet</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;