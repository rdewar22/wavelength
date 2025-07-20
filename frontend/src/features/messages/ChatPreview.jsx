import { useSelector } from "react-redux"
import { selectCurrentUserId } from "../../components/authSlice"
import { useDeleteChatMutation } from "../../components/messages/messagesApiSlice"
import { IoPersonCircleOutline } from "react-icons/io5";
import { useState } from "react";
import "./ChatPreview.css"

const ChatPreview = ({ chatName, chatId, latestMessage, toggleConversation, users, isGroupChat }) => {
  const currentUserId = useSelector(selectCurrentUserId);
  const [deleteChat] = useDeleteChatMutation();
  const [imageError, setImageError] = useState(false);

  if (!isGroupChat && users && users.length > 0) {
    const otherUser = users.find(user => user._id !== currentUserId);
    if (otherUser) {
      chatName = otherUser.username;
    }
  }

  const baseProfilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${chatName}_profPic.jpeg`;

  const handleClick = () => {
    toggleConversation(chatName, chatId);
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent triggering the parent button's onClick
    try {
      await deleteChat(chatId).unwrap();
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return "";
  
    const now = new Date();
    const date = new Date(isoString);
    const diffInHours = (now - date) / (1000 * 60 * 60); // Difference in hours
    const diffInDays = diffInHours / 24; // Difference in days
  
    if (diffInHours < 24) {
      // Less than 24 hours ago - show time only
      return date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInDays < 7) {
      // Between 24 hours and 7 days ago - show day of week
      return date.toLocaleString("en-US", {
        weekday: "short",
      });
    } else {
      // More than 7 days ago - show month and day
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (!latestMessage) return 

  return (
    <div className="chat-preview-wrapper">
      <button className="message-preview" onClick={handleClick}>
        <div className="avatar-wrapper">
          {!imageError ? (
            <img 
              src={baseProfilePicUri} 
              alt={`${chatName} avatar`} 
              className="avatar-image"
              onError={handleImageError}
            />
          ) : (
            <IoPersonCircleOutline className="avatar-icon" />
          )}
        </div>
        <div className="message-content">
          <div className="message-header">
            <span className="chatname">{chatName}</span>
            <span className="timestamp">{formatTimestamp(latestMessage?.updatedAt)}</span>
          </div>
          <div className="message-text">
            <p className="preview-text">{latestMessage?.message}</p>
            {latestMessage?.read && <span className="unread-badge"></span>}
          </div>
        </div>
      </button>
      {/* <button 
        className="delete-chat-btn" 
        onClick={handleDelete}
        title="Delete chat"
      >
        ×
      </button> */}
    </div>
  );
}

export default ChatPreview