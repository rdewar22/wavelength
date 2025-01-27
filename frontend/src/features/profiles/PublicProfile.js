import './Profile.css'
import React, { useState } from "react";
import { useLocation } from 'react-router-dom';
import { IoPersonCircleOutline } from "react-icons/io5";
import { selectCurrentUser, selectisProfPicInDb } from "../auth/authSlice";
import { useSelector } from "react-redux";
import { useGetPostsByUserNameQuery, selectPostIds } from '../posts/postsApiSlice';
import PostsExcerpt from '../posts/PostsExcerpt';

const PublicProfile = ({ token }) => {
  const location = useLocation();
  console.log("location:", location)
  console.log("location.state:", location.state)
  const username = location?.state.username;
  const profilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${username}_profPic.jpeg`
  const imageSrc = profilePicUri + "?" + Math.random().toString(36);
  const [counter, setCounter] = useState(0);

  const {
    data: posts,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetPostsByUserNameQuery(username)

  
  let content;
  if (isLoading) {
    content = <p>"Loading..."</p>;
  } else if (isSuccess) {
    content = [...posts.ids].reverse().map(postId => <PostsExcerpt key={postId} postId={postId} />);
  } else if (isError) {
    content = <p>Error: {error.originalStatus} {error.status}</p>  //JSON.stringify()
  }

  const reloadParent = () => {
    setCounter(prev => prev + 1); // Incrementing state triggers a re-render
  };

  return (
    <>
      <div className="profile">
        <div className='profile-page-header'>
          <div className="avatar">
            <div className="avatar-wrapper">
                <img
                  src={imageSrc}
                  alt={`${username} avatar`}
                />
            </div>
          </div>
          <p className='profile-name'>{username}</p>
        </div>
        <div className="body">
          {content}
        </div>
      </div>
    </>
  );
};

export default PublicProfile;