import React, { useState } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { Link, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spinner } from 'reactstrap';
import { selectCurrentUserName, selectCurrentUserId, selectProfilePicUri, selectisProfPicInDb } from "../../components/authSlice";
import { useGetPostsByUserIdQuery } from '../../components/postsApiSlice';
import UploadAvatar from "./UploadAvatar";
import PostExcerpt from '../posts/PostExcerpt';
import './Profile.css'

const Profile = () => {
  const location = useLocation();

  const { pageUserId } = location.state;
  const { pageUserName } = useParams();

  const loggedInUserName = useSelector(selectCurrentUserName);
  const userId = useSelector(selectCurrentUserId);
  const reduxProfilePicUri = useSelector(selectProfilePicUri);
  const reduxIsProfPicInDb = useSelector(selectisProfPicInDb);

  const canEdit = loggedInUserName === pageUserName;

  const [isProfPic, setProfPic] = useState(true);
  const [isProfPicLoading, setIsProfPicLoading] = useState(true);
  const [counter, setCounter] = useState(0);

  // Determine if this is the logged-in user's profile
  const isOwnProfile = loggedInUserName === pageUserName;

  // Use Redux state for own profile, fallback for other users' profiles
  const profilePicUri = isOwnProfile && reduxProfilePicUri ?
    reduxProfilePicUri :
    `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${pageUserName}_profPic.jpeg`;

  // Use Redux state for own profile, or default logic for other users
  const hasProfilePic = isOwnProfile ? reduxIsProfPicInDb : isProfPic;

  // Add counter-based cache busting for manual refresh
  const imageSrc = counter > 0
    ? `${profilePicUri}${profilePicUri.includes('?') ? '&' : '?'}manual=${counter}`
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

  let postsContent;
  if (isPostsLoading) {
    postsContent = <Spinner />;
  } else if (isPostsSuccess) {
    if (posts?.ids && posts.ids.length > 0) {
      postsContent = posts.ids.slice().reverse().map(postId => (
        <PostExcerpt postId={postId} post={posts.entities[postId]} />
      ));
    } else {
      postsContent = <p className="empty-state">No posts yet. Be the first to share!</p>;
    }
  } else if (isPostsError) {
    postsContent = <p>Error: {postsError?.originalStatus} {postsError?.status}</p>
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
              {hasProfilePic ? (
                <>
                  {isProfPicLoading && <Spinner />}
                  <img
                    src={imageSrc}
                    alt={`${pageUserName} avatar`}
                    onLoad={() => setIsProfPicLoading(false)}
                    onError={() => {
                      // Only update local state for non-own profiles
                      if (!isOwnProfile) {
                        setProfPic(false);
                      }
                      setIsProfPicLoading(false);
                    }}
                    style={{ display: isProfPicLoading ? 'none' : 'block' }}
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
            <h2>Posts</h2>
            <div className="post-controls">
              {canEdit && <Link to="/addpostform" className="add-post-button">
                Create New Post
              </Link>}
            </div>
            {postsContent}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;