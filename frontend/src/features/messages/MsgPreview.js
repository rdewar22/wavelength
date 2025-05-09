import { useSelector } from "react-redux"
import { makeSelectMessages } from "./messagesApiSlice"
import "./MsgPreview.css"

const MsgPreview = ({ message, username, toggleConversation }) => {
    
    const convoPartner = message?.from === username ? message?.to : message?.from;

    const handleClick = () => {
        toggleConversation(convoPartner);
    };

    return (
        <button className="message-preview" onClick={handleClick}>
          <div className="avatar-wrapper">
            {/* Replace with actual avatar component or icon */}
            <div className="avatar-placeholder"></div>
          </div>
          <div className="message-content">
            <div className="message-header">
              <span className="username">{convoPartner}</span>
              <span className="timestamp">{message?.date}</span>
            </div>
            <div className="message-text">
              <p className="preview-text">{message?.message}</p>
              {message?.unread && <span className="unread-badge"></span>}
            </div>
          </div>
        </button>
      );
}

export default MsgPreview