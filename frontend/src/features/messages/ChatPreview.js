import { useSelector } from "react-redux"
import { makeSelectMessages } from "./messagesApiSlice"
import "./ChatPreview.css"

const ChatPreview = ({ chatName, latestMessage, toggleConversation }) => {
    

    const handleClick = () => {
        toggleConversation(chatName);
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
              <span className="timestamp">{latestMessage?.updatedAt}</span>
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