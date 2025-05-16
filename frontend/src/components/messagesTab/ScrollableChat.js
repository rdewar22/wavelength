import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../../config/ChatLogics";
import { ChatState } from "../../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div className="message-container" key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
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
                m.sender._id === user._id ? "sent" : "received"
              }`}
              style={{
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? "3px" : "10px",
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