import { useSelector } from "react-redux"
import { makeSelectMessages } from "./messagesApiSlice"
import "./ChatPreview.css"

const ChatPreview = ({ chatName, chatId, latestMessage, toggleConversation }) => {


  const handleClick = () => {
    toggleConversation(chatName, chatId);
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

  return (
    <button className="message-preview" onClick={handleClick}>
      <div className="avatar-wrapper">
        {/* Replace with actual avatar component or icon */}
        <div className="avatar-placeholder"></div>
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
  );
}

export default ChatPreview