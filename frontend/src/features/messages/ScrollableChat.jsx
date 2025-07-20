import React, { useMemo } from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../../config/ChatLogics";
import { useSelector } from "react-redux";
import { selectCurrentUserId } from "../../components/authSlice";
import "./ScrollableChat.css"

const ScrollableChat = React.memo(({ messages }) => {
  const userId = useSelector(selectCurrentUserId);

  // Memoize the rendered messages to prevent unnecessary re-calculations
  const renderedMessages = useMemo(() => {
    if (!messages?.length) return null;

    return messages.map((m, i) => (
      <div className="message-container" key={m._id}>
        {(isSameSender(messages, m, i, userId) ||
          isLastMessage(messages, i, userId)) && (
            <div
              className="avatar-tooltip"
              title={m.sender.username}
            >
              <img
                className="message-avatar"
                src={m.sender.profilePicUri}
                alt={m.sender.username}
                loading="lazy" // Add lazy loading for better performance
              />
            </div>
          )}
        <div
          className={`message-bubble ${m.sender["_id"] === userId ? "sent" : "received"
            }`}
          style={{
            marginLeft: isSameSenderMargin(messages, m, i, userId),
            marginTop: isSameUser(messages, m, i, userId) ? "3px" : "10px",
          }}
        >
          {m.message}
        </div>
      </div>
    ));
  }, [messages, userId]);

  return (
    <ScrollableFeed
      forceScroll={true}
      viewableDetectionEpsilon={50}
    >
      {renderedMessages}
    </ScrollableFeed>
  );
});

ScrollableChat.displayName = 'ScrollableChat';

export default ScrollableChat;