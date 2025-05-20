import React, { useState } from 'react'
import ScrollableChat from './ScrollableChat';
import ProfileModal from '../ProfileModal';
import Lottie from 'react-lottie';
import animationData from "../../animations/typing.json"
import { getSenderFull } from '../../config/ChatLogics';
import { useGetMessagesInChatQuery } from '../../features/messages/messagesApiSlice';

const SingleChat = ({ chatId }) => {
    const [newMessage, setNewMessage] = useState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    const {
        data: messages = [],
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetMessagesInChatQuery(chatId);

    return (
        <div className="chat-container">
            <div className="chat-active">
                {/* Header
                <div className="chat-header">
                    <button
                        className="back-button mobile-only"
                        onClick={() => setSelectedChat("")}
                    >
                        ←
                    </button>

                    {messages && (
                        <div className="chat-title">
                            {!selectedChat.isGroupChat ? (
                                <>
                                    <span>{getSender(user, selectedChat.users)}</span>
                                    <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                                </>
                            ) : (
                                <>
                                    <span>{selectedChat.chatName.toUpperCase()}</span>
                                    {/* <UpdateGroupChatModal
                                            fetchMessages={fetchMessages}
                                            fetchAgain={fetchAgain}
                                            setFetchAgain={setFetchAgain}
                                        /> */}

                {/* Messages area */}
                <div className="messages-container">
                    {isLoading ? (
                        <div className="spinner-container">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="messages">
                            <ScrollableChat messages={messages} />
                        </div>
                    )}

                    {/* Input area
                    <div className="message-input-container">
                        {istyping && (
                            <div className="typing-indicator">
                                <Lottie
                                    options={defaultOptions}
                                    width={70}
                                    style={{ marginBottom: '15px', marginLeft: 0 }}
                                />
                            </div>
                        )}
                        <input
                            type="text"
                            className="message-input"
                            placeholder="Enter a message.."
                            value={newMessage}
                            onChange={typingHandler}
                            onKeyDown={sendMessage}
                        />
                    </div> */}
                </div>
            </div>
        </div>
    );
}

export default SingleChat