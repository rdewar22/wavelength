import { useState } from "react"; // Add this import
import { useFindUserQuery } from "../../features/users/usersApiSlice";
import { IoPersonCircleOutline } from "react-icons/io5";
import "./ProfileModal.css"

const ProfileModal = ({ userName }) => {
    const [showProfile, setShowProfile] = useState(false); // State to control visibility

    const {
        data: users,
        isLoading,
        isError,
        error
    } = useFindUserQuery(userName);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <div>Error: {error.message}</div>;
    }

    const user = users?.find(user => user.username === userName);

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="profile-modal">
            {/* Button to toggle visibility */}
            <button className="profile-modal-button" onClick={() => setShowProfile(!showProfile)}>
                {showProfile ? "Hide Profile" : "Profile"}
            </button>

            {/* Only show profile if `showProfile` is true */}
            {showProfile && (
                <>
                    {user.profilePicUri ? (
                        <img
                            src={user.profilePicUri}
                            alt={`${user.username} avatar`}
                        />
                    ) : (
                        <IoPersonCircleOutline size={40} />
                    )}
                    <h2>{user.username}'s Profile</h2>
                    {/* Render other user details here */}
                </>
            )}
        </div>
    );
};

export default ProfileModal;