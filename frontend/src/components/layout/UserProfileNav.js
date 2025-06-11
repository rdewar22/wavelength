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

    // Route to login if no user, otherwise to profile
    const linkDestination = user ? "/profile" : "/login";
    const displayName = user ? userName : "Login";

    return (
        <Link to={linkDestination} className="user-profile-nav">
            <div className="profile-avatar">
                {user && !imageError && profilePicUri ? (
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
            <span className="profile-username">{displayName}</span>
        </Link>
    );
};

export default UserProfileNav; 