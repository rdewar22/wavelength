import { useState } from 'react';
import './MessagesTab.css'

export const MessageTab = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMessages = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="messages-container">
            {/* Messages Tab */}
            <button className="messages-tab" onClick={toggleMessages}>
                Messages
            </button>

            {/* Overlay */}
            <div className={`messages-overlay ${isOpen ? "open" : ""}`}>
                <div className="messages-content">
                    <h2>Conversations</h2>
                    <ul>
                        <li>Conversation 1</li>
                        <li>Conversation 2</li>
                        <li>Conversation 3</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};