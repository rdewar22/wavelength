import { useState } from 'react';
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { selectCurrentUser, selectCurrentUserId } from '../features/auth/authSlice';
import { MessagesSearchBar } from "./MessagesSearchBar"
import { useFetchChatsForUserQuery, useAccessChatMutation, useSendMessageMutation } from '../features/messages/messagesApiSlice';
import { makeSelectMessages } from "../features/messages/messagesApiSlice"
import './MessagesTab.css'
import ChatPreview from '../features/messages/ChatPreview';

export const MessageTab = () => {
    const user = useSelector(selectCurrentUser);
    const userId = useSelector(selectCurrentUserId);
    const [message, setMessage] = useState("");
    const [sendMessage] = useSendMessageMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showConversation, setShowConversation] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]); // Add this line
    const [currentConversation, setCurrentConversation] = useState('');
    const [currentMsgs, setCurrentMsgs] = useState([]);
    const [groupChatName, setGroupChatName] = useState();
    const [chats, setChats] = useState();


    const {
        data,
        isLoading,
        isSuccess,
        isError,
        error
    } = useFetchChatsForUserQuery(userId, {
        skip: !user
    });

    const [accessChat, { isLoading: isAccessingChat }] = useAccessChatMutation();


    const toggleMessagesTab = () => {
        setIsOpen(!isOpen);
    };

    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

    const toggleConversation = (userId = null) => {

        setCurrentConversation(userId);
        setShowConversation(!showConversation);
    }

    const handleChange = (value) => {
        setMessage(value);
    }

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast.warning("Please fill all the fields", {
                hideProgressBar: true,
                isClosable: true,
                position: "top",
            });
            return;
        }

        try {
            // Prepare the request data
            const chatData = {
                groupName: groupChatName,
                userIds: selectedUsers.map(user => user._id) // Convert to array of user IDs
            };

            // Call the mutation
            await accessChat(chatData).unwrap();

            // On success
            toast.success("Chat created successfully!");
            setGroupChatName('');
            setSelectedUsers([]);
            toggleOverlay();




        } catch (error) {
            toast.error(error.data?.message || "Failed to create chat");
            console.error("Chat creation error:", error);
        }
    }

    const handleSendMessage = async (to, from) => {
        try {
            console.log(to, from, message);
            await sendMessage({ to, from, message }).unwrap(); // ✅ Call the mutation
            setMessage(''); // Clear input after sending
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    let content;

    if (isLoading) {
        content = <p>Loading...</p>;
    } else if (isSuccess) {
        // Safely handle `data` (could be `null` or an array)
        const chatsArray = Object.values(data.entities);
        content = chatsArray
            .reverse() // Reverse only if data exists
            .map(chat => (
                <ChatPreview
                    key={chat._id}
                    chatName={chat.chatName}
                    latestMessage={chat.latestMessage}
                    toggleConversation={toggleConversation}
                />
            ));
    } else if (isError) {
        content = <p>Error: {error.originalStatus} {error.status}</p>  //JSON.stringify()
    }

    return (
        <div className="messages-container">
            {/* Messages Tab */}

            <div className={`messages-overlay ${isOpen ? "open" : ""}`}>
                <button className="messages-tab" onClick={toggleMessagesTab}>
                    Messages
                </button>
                {user ? (
                    <>
                        {currentConversation ? (
                            <div className="messages-content">
                                <button onClick={() => toggleConversation(null)} className="back-button">&lt;</button>
                                <h3 className='message-recipient'>{currentConversation}</h3>

                                <div className="full-conversation">
                                    {currentMsgs.map((msg, index) => (
                                        <div key={index} className={`message ${msg.from === user ? 'sent' : 'received'}`}>
                                            <p>{msg.message}</p>
                                            <small>{new Date(msg.updatedAt).toLocaleString()}</small>
                                        </div>
                                    ))}
                                </div>

                                <input
                                    type="text"
                                    className="message-input"
                                    placeholder="Message"
                                    value={message}
                                    onChange={(e) => handleChange(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSendMessage(currentConversation, user);
                                            handleChange('');
                                        }
                                    }}
                                />

                            </div>
                        ) : (
                            <div className="messages-content">
                                <button onClick={toggleOverlay} className='new-convo-button'>+</button>
                                <ul>
                                    <section>
                                        {content || <p>Start a new conversation with the '+' button!</p>}
                                    </section>
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="no-user-message">
                            <p>
                                Please <Link to="/login" className='login-link'>login</Link> or <Link className='register-link' to="/register">register</Link> to use messages.
                            </p>
                        </div>
                    </>
                )}


            </div>

            {/* Overlay */}
            {showOverlay && (
                <div className="overlay">
                    <div className="overlay-content">
                        <h2>New Conversation</h2>
                        <p>Start a new conversation here.</p>
                        <input
                            type="text"
                            placeholder="Chat Name"
                            onChange={(e) => setGroupChatName(e.target.value)} />
                        <MessagesSearchBar
                            toggleConversation={toggleConversation}
                            toggleOverlay={toggleOverlay}
                            selectedUsers={selectedUsers}
                            setSelectedUsers={setSelectedUsers}
                        />
                        <button onClick={handleSubmit} className="close-button">Create Chat</button>
                    </div>
                </div>
            )}
        </div>
    );
};