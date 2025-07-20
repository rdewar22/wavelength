import React from 'react';
import './UserBadgeItem.css'; // Create this CSS file

const UserBadgeItem = ({ user, handleFunction }) => {
    return (
        <div className="user-badge">
            {user.username}
            <span
                className="badge-close"
                onClick={handleFunction}
            >
                ×
            </span>
        </div>
    );
};

export default UserBadgeItem;