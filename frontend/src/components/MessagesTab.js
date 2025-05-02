import { useState } from 'react';
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import { selectCurrentUser } from '../features/auth/authSlice';
import { MessagesSearchBar } from "./MessagesSearchBar"
import { useGetMessagesForUserNameQuery, useSendMessageMutation } from '../features/messages/messagesApiSlice';
import { makeSelectMessages } from "../features/messages/messagesApiSlice"
import './MessagesTab.css'
import MsgPreview from '../features/messages/MsgPreview';

export const MessageTab = () => {
    const user = useSelector(selectCurrentUser)
    const [message, setMessage] = useState("");
    const [sendMessage] = useSendMessageMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showConversation, setShowConversation] = useState(false);
    const [currentConversation, setCurrentConversation] = useState('');
    const [currentMsgs, setCurrentMsgs] = useState([]);

    const {
        data,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetMessagesForUserNameQuery(user, {
        skip: !user
    });


    const toggleMessagesTab = () => {
        setIsOpen(!isOpen);
    };

    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

    const toggleConversation = (username = null) => {
        const conversationMsgMap = new Map();

        if (data?.entities) {
            Object.values(data.entities).forEach(msg => {
                const convoPartner = msg.to === user ? msg.from : msg.to;
                const existing = recentMsgMap.get(convoPartner);

                if (!existing || new Date(msg.updatedAt) > new Date(existing.updatedAt)) {
                    recentMsgMap.set(convoPartner, msg);
                }
            });
        }

        const conversationMsgList = Array.from(recentMsgMap.values());

        setCurrentMsgs(conversationMsgList);
        setCurrentConversation(username);
        setShowConversation(!showConversation);
    }

    const handleChange = (value) => {
        setMessage(value);
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


    const recentMsgMap = new Map();

    if (data?.entities) {
        Object.values(data.entities).forEach(msg => {
            const convoPartner = msg.to === user ? msg.from : msg.to;
            const existing = recentMsgMap.get(convoPartner);

            if (!existing || new Date(msg.updatedAt) > new Date(existing.updatedAt)) {
                recentMsgMap.set(convoPartner, msg);
            }
        });
    }

    const recentMsgList = Array.from(recentMsgMap.values());



    if (isLoading) {
        content = <p>Loading...</p>;
    } else if (isSuccess) {
        content = [...recentMsgList].reverse().map(message => (
            <MsgPreview
                key={message._id}
                message={message}
                username={user}
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
                        <MessagesSearchBar toggleConversation={toggleConversation} toggleOverlay={toggleOverlay} />
                        <h2>New Conversation</h2>
                        <p>Start a new conversation here.</p>
                        <button onClick={toggleOverlay} className="close-button">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};