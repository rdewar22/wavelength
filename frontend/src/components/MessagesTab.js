import { useState, useEffect } from 'react';
import { MessagesSearchBar } from "./MessagesSearchBar"
import './MessagesTab.css'

export const MessageTab = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showMessages, setShowMessages] = useState(false);

    const toggleMessagesTab = () => {
        setIsOpen(!isOpen);
    };

    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

    const toggleMessages = () => {
        setShowMessages(!showMessages);
    }

    return (
        <div className="messages-container">
            {/* Messages Tab */}

            <div className={`messages-overlay ${isOpen ? "open" : ""}`}>
                <button className="messages-tab" onClick={toggleMessagesTab}>
                    Messages
                </button>
                <div className="messages-content">
                    <button onClick={toggleOverlay} className='new-convo-button'>+</button>
                    <ul>
                        <li>Conversation 1</li>
                    </ul>
                </div>
            </div>

            {/* Overlay */}
            {showOverlay && (
                <div className="overlay">
                    <div className="overlay-content">
                        <MessagesSearchBar toggleMessages={toggleMessages} toggleOverlay={toggleOverlay} />
                        <h2>New Conversation</h2>
                        <p>Start a new conversation here.</p>
                        <button onClick={toggleOverlay} className="close-button">Close</button>
                    </div>
                </div>
            )}

            {showMessages && (
                <div className="new-div">
                    <h2>This is the New Div</h2>
                    <p>This div replaces the messages overlay.</p>
                    <button onClick={toggleMessages} className="close-button">
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};