import React from 'react';
import './UserBadgeItem.css'; // Create this CSS file

const UserBadgeItem = ({ user, handleFunction }) => {
    return (
        <div className="user-badge" onClick={handleFunction}>
            {user.username}
            <span
                className="badge-close"
                onClick={(e) => {
                    e.stopPropagation();
                    handleFunction();
                }}
            >
                ×
            </span>
        </div>
    );
};

export default UserBadgeItem;