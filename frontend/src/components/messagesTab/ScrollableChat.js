import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../../config/ChatLogics";
import { useSelector } from "react-redux";
import { selectCurrentUserId } from "../../features/auth/authSlice";
import "./ScrollableChat.css"

const ScrollableChat = ({ messages }) => {
  const userId = useSelector(selectCurrentUserId);
  const messageIds = Object.values(messages["entities"]);

  return (
    <ScrollableFeed>
      {messages &&
        messageIds.map((m, i) => (
          <div className="message-container" key={m._id}>
            {(isSameSender(messageIds, m, i, userId) ||
              isLastMessage(messageIds, i, userId)) && (
              <div 
                className="avatar-tooltip" 
                title={m.sender.username}
              >
                <img
                  className="message-avatar"
                  src={m.sender.profilePicUri}
                  alt={m.sender.username}
                />
              </div>
            )}
            <div
              className={`message-bubble ${
                m.sender._id === userId ? "sent" : "received"
              }`}
              style={{
                marginLeft: isSameSenderMargin(messageIds, m, i, userId),
                marginTop: isSameUser(messageIds, m, i, userId) ? "3px" : "10px",
              }}
            >
              {m.message}
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;