import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectCurrentUserId } from '../../features/auth/authSlice';
import { IoPersonCircleOutline } from "react-icons/io5";
import './UserProfileNav.css';

const UserProfileNav = () => {
    const userName = useSelector(selectCurrentUser);
    const user = useSelector(state => state.auth.user);
    const [imageError, setImageError] = useState(false);

    // Construct profile picture URL
    const baseProfilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${userName}_profPic.jpeg`;
    const profilePicUri = user?.profilePicUri || baseProfilePicUri;

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <Link to="/profile" className="user-profile-nav">
            <div className="profile-avatar">
                {!imageError && profilePicUri ? (
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
            <span className="profile-username">{userName}</span>
        </Link>
    );
};

export default UserProfileNav; 