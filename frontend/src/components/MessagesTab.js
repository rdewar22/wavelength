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


            {/* Overlay */}
            <div className={`messages-overlay ${isOpen ? "open" : ""}`}>
                <button className="messages-tab" onClick={toggleMessages}>
                    Messages
                </button>
                <div className="messages-content">
                    <button className='new-convo-button'>+</button>
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