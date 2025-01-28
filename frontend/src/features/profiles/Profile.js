import './Profile.css'
import React, { useState, useEffect } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import UpoloadAvatar from "./UploadAvatar";
import { selectCurrentUser, selectisProfPicInDb } from "../auth/authSlice";
import { useSelector } from "react-redux";
import { useGetPostsByUserNameQuery, selectPostIds } from '../posts/postsApiSlice';
import PostsExcerpt from '../posts/PostsExcerpt';

const Profile = ({ token }) => {
  const userName = useSelector(selectCurrentUser);
  const [isProfPic, setProfPic] = useState(true);
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
              {isProfPic ? (
                <img
                  src={imageSrc}
                  alt={`${userName} avatar`}
                  onError={() => setProfPic(false)}
                />

              ) : (
                <IoPersonCircleOutline size={40} />
              )}
              <UpoloadAvatar
                avatarUrl={profilePicUri}
                reloadParent={reloadParent}
              />
            </div>
          </div>
          <p className='profile-name'>{userName}</p>
        </div>
        <div className="body">
          {content}
        </div>
      </div>
    </>
  );
};

export default Profile;