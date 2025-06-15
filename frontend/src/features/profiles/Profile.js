import './Profile.css'
import React, { useState, useEffect } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { Link, useParams, useLocation } from "react-router-dom";
import UploadAvatar from "./UploadAvatar";
import UploadAudio from "./UploadAudio";
import { selectCurrentUserName, selectCurrentUserId } from "../auth/authSlice";
import { useSelector } from "react-redux";
import { useGetPostsByUserIdQuery } from '../posts/postsApiSlice';
import { selectAudiosByUser, useGetAudiosByUserIdQuery } from '../audio/audioApiSlice';
import PostExcerpt from '../posts/PostExcerpt';
import { Spinner } from 'reactstrap';
import AudioExcerpt from '../audio/AudioExcerpt';

const Profile = () => {
  const location = useLocation();
  
  const { pageUserId } = location.state;
  const { pageUserName } = useParams();

  const loggedInUserName = useSelector(selectCurrentUserName);

  const canEdit = loggedInUserName === pageUserName;


  const userId = useSelector(selectCurrentUserId);
  const user = useSelector(state => state.auth.user);


  const [isProfPic, setProfPic] = useState(true);
  const [isProfPicLoading, setIsProfPicLoading] = useState(true);

  // Use profile picture URL from Redux store (user object now has profilePicUri)
  const profilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${pageUserName}_profPic.jpeg`;

  const [counter, setCounter] = useState(0);

  // Use the profilePicUri from Redux (which now includes cache busting) or add counter for manual refresh
  const imageSrc = counter > 0
    ? `${profilePicUri}?v=${counter}`
    : profilePicUri;

  // Fetch posts
  const {
    data: posts,
    isLoading: isPostsLoading,
    isSuccess: isPostsSuccess,
    isError: isPostsError,
    error: postsError
  } = useGetPostsByUserIdQuery(pageUserId, {
    skip: !pageUserId // Skip the query if we don't have a userId
  })

  // Fetch audios - make sure we have a userId before fetching
  const {
    data: audiosData,
    isLoading: isAudiosLoading,
    isSuccess: isAudiosSuccess,
    isError: isAudiosError,
    error: audiosError
  } = useGetAudiosByUserIdQuery(pageUserId, {
    skip: !pageUserId // Skip the query if we don't have a userId
  })


  let postsContent;
  if (isPostsLoading) {
    postsContent = <p>"Loading..."</p>;
  } else if (isPostsSuccess) {
    if (posts?.ids && posts.ids.length > 0) {
      postsContent = [...(posts?.ids || [])].reverse().map(postId => <PostExcerpt key={postId} postId={postId} userId={userId} />);
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
      audiosContent = (audiosData?.ids || []).slice().reverse().map(data => <AudioExcerpt key={data} audioId={data} userId={pageUserId} />);
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
                    alt={`${pageUserName} avatar`}
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
              {canEdit && <UploadAvatar
                avatarUrl={profilePicUri}
                reloadParent={reloadParent}
              />}
            </div>
          </div>
          <div className='profile-name'>{pageUserName}</div>
        </div>

        <div className="content-sections">

          <div className="posts-section">
            <div className="body">
              <h2>Posts</h2>
              <div className="post-controls">
                {canEdit && <Link to="/addpostform" className="add-post-button">
                  Create New Post
                </Link>}
              </div>
              {postsContent}
            </div>
          </div>
          <div className="audio-section">
            <h2>Audio Files</h2>
            <div className="audio-controls">
              {canEdit && <UploadAudio
                buttonLabel="Upload New Audio"
              />}
            </div>
            <div className="audio-list">
              {audiosContent || <p style={{fontSize: '1.2em', fontWeight: 'bold', color: '#666'}}>No audio files uploaded yet</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;