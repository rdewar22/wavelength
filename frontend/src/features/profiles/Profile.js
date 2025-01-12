import axios from "axios";
import React, { useState, useEffect } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import UpoloadAvatar from "./UploadAvatar";
import { selectCurrentUser, selectisProfPicInDb } from "../auth/authSlice";
import { useSelector } from "react-redux";

const Profile = ({ token }) => {
  const userName = useSelector(selectCurrentUser);
  const isProfPicInDb = useSelector(selectisProfPicInDb);
  const profilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${userName}_profPic.jpeg`
  const imageSrc = profilePicUri + "?" + Math.random().toString(36);
  const [isUserUpdated, setisUserUpdated] = useState(false);
  const [counter, setCounter] = useState(0);

  const reloadParent = () => {
    setCounter(prev => prev + 1); // Incrementing state triggers a re-render
};

  return (
    <div className="profile">
      <div className="avatar">
        <div className="avatar-wrapper">
          {isProfPicInDb ? (
            <img
              src={imageSrc}
              alt={`${userName} avatar`}
            />
          ) : (
            <IoPersonCircleOutline />
          )}
          <UpoloadAvatar
            avatarUrl={profilePicUri}
            reloadParent={reloadParent}
          />
        </div>
      </div>
      <div className="body">
        <p>Name: {userName}</p>
      </div>
    </div>
  );
};

export default Profile;