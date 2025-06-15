import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoPersonCircleOutline } from "react-icons/io5";
import './UserProfileNav.css';

const UserProfileNav = ({ userName }) => {
    const [imageError, setImageError] = useState(false);

    // Construct profile picture URL
    const baseProfilePicUri = `${process.env.PROFILE_PIC_BASE_URL}/${userName}_profPic.jpeg`;
    const profilePicUri = baseProfilePicUri;

    const handleImageError = () => {
        setImageError(true);
    };

    const linkDestination = userName ? `/${userName}` : "/login";


    return (
        <Link to={linkDestination} className="user-profile-nav">
            <div className="profile-avatar">
                {!imageError ? (
                    <img
                        src={profilePicUri}
                        alt={`${userName} avatar`}
                        className="avatar-image"
                        onError={handleImageError}
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