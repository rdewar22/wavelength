import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../../config/ChatLogics";
import { useSelector } from "react-redux";
import { selectCurrentUserId } from "../../features/auth/authSlice";

const ScrollableChat = ({ messages }) => {
  const userId = useSelector(selectCurrentUserId);

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div className="message-container" key={m._id}>
            {(isSameSender(messages, m, i, userId) ||
              isLastMessage(messages, i, userId)) && (
              <div 
                className="avatar-tooltip" 
                title={m.sender.name}
              >
                <img
                  className="message-avatar"
                  src={m.sender.pic}
                  alt={m.sender.name}
                />
              </div>
            )}
            <div
              className={`message-bubble ${
                m.sender._id === userId ? "sent" : "received"
              }`}
              style={{
                marginLeft: isSameSenderMargin(messages, m, i, userId),
                marginTop: isSameUser(messages, m, i, userId) ? "3px" : "10px",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;