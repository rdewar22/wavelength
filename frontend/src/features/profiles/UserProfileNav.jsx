import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoPersonCircleOutline } from "react-icons/io5";
import { useIsProfPicInDbQuery } from '../../components/usersApiSlice';
import './UserProfileNav.css';

const UserProfileNav = ({ userName, userId }) => {
    // Get profile picture info from Redux state
    const { data: isProfPicInDb } = useIsProfPicInDbQuery(userName);

    // Fallback profile picture URL (without cache-busting for consistency)
    const fallbackProfilePicUri = userName ?
        `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${userName}_profPic.jpeg` : null;

    const linkDestination = userName ? `/${userName}` : "/login";


    return (
        <Link to={linkDestination} state={{ pageUserId: userId }} className="user-profile-nav">
            <div className="profile-avatar">
                {userName && isProfPicInDb ? (
                    <img
                        src={fallbackProfilePicUri}
                        alt={`${userName} avatar`}
                        className="avatar-image"
                        onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                        }}
                    />
                ) : <IoPersonCircleOutline className="avatar-icon" />}
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