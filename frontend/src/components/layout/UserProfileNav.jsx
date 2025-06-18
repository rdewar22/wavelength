import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoPersonCircleOutline } from "react-icons/io5";
import './UserProfileNav.css';

const UserProfileNav = ({ userName, userId }) => {

    // Construct profile picture URL
    const profilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${userName}_profPic.jpeg`;


    const linkDestination = userName ? `/${userName}` : "/login";


    return (
        <Link to={linkDestination} state={{ pageUserId: userId }} className="user-profile-nav">
            <div className="profile-avatar">
                {userName ? (
                    <img
                        src={profilePicUri}
                        alt={`${userName} avatar`}
                        className="avatar-image"
                    />
                ) : (
                    <IoPersonCircleOutline className="avatar-icon" />
                )}
            </div>
            {userName ? (
                <span className="profile-username">{userName}</span>
            ) : (
                <span className="profile-username">Login</span>
            )}
        </Link>
    );
};

export default UserProfileNav; 