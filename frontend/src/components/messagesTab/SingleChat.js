import React, { useState } from 'react'
import ScrollableChat from './ScrollableChat';
import ProfileModal from '../ProfileModal';
import { getSenderFull } from '../../config/ChatLogics';

const SingleChat = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState();

    return (
        <div className="chat-container">
            {selectedChat ? (
                <div className="chat-active">
                    {/* Header */}
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
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Messages area */}
                    <div className="messages-container">
                        {loading ? (
                            <div className="spinner-container">
                                <div className="spinner"></div>
                            </div>
                        ) : (
                            <div className="messages">
                                <ScrollableChat messages={messages} />
                            </div>
                        )}

                        {/* Input area */}
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
                        </div>
                    </div>
                </div>
            ) : (
                <div className="no-chat-selected">
                    <p>Click on a user to start chatting</p>
                </div>
            )}
        </div>
    );
}

export default SingleChat