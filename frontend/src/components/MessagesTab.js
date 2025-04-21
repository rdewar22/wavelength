import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import { selectCurrentUser } from '../features/auth/authSlice';
import { MessagesSearchBar } from "./MessagesSearchBar"
import { useSendMessageMutation } from '../features/messages/messagesApiSlice';
import './MessagesTab.css'

export const MessageTab = () => {
    const user = useSelector(selectCurrentUser)
    const [message, setMessage] = useState("");
    const [sendMessage] = useSendMessageMutation(); 
    const [isOpen, setIsOpen] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showConversation, setShowConversation] = useState(false);
    const [currentConversation, setcurrentConversation] = useState('');

    const toggleMessagesTab = () => {
        setIsOpen(!isOpen);
    };

    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

    const toggleConversation = (username = null) => {
        setcurrentConversation(username);
        setShowConversation(!showConversation);
    }

    const handleChange = (value) => {
        setMessage(value);
    }

    const handleSubmit = async () => {
        try {
          await sendMessage(message).unwrap(); // ✅ Call the mutation
          setMessage(''); // Clear input after sending
        } catch (err) {
          console.error('Failed to send message:', err);
        }
    };

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
                                <input 
                                    type="text" 
                                    className="message-input" 
                                    placeholder="Message" 
                                    value={message} 
                                    onChange={(e) => handleChange(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSubmit();
                                            handleChange('');
                                        }
                                    }}
                                    />

                            </div>
                        ) : (
                            <div className="messages-content">
                                <button onClick={toggleOverlay} className='new-convo-button'>+</button>
                                <ul>
                                    <li>Conversation 1</li>
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="no-user-message">
                            <p>
                                Please <Link to="/login" className='login-link'>login</Link> or <Link className='register-link'to="/register">register</Link> to use messages.
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

            {/* {showConversation && (
                <div className="new-div">
                    <h2>This is the New Div</h2>
                    <p>This div replaces the messages overlay.</p>
                    <button onClick={toggleConversation} className="close-button">
                        Close
                    </button>
                </div>
            )} */}
        </div>
    );
};