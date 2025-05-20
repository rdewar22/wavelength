import React, { useState } from 'react'
import ScrollableChat from './ScrollableChat';
import ProfileModal from '../ProfileModal';
import Lottie from 'react-lottie';
import animationData from "../../animations/typing.json"
import { getSenderFull } from '../../config/ChatLogics';
import { useGetMessagesInChatQuery, useSendMessageMutation } from '../../features/messages/messagesApiSlice';
import "./SingleChat.css"

const SingleChat = ({ chatId }) => {
    const [newMessage, setNewMessage] = useState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const [message, setMessage] = useState("");
    const [sendMessage] = useSendMessageMutation();
    const [localMessages, setLocalMessages] = useState([]); // For optimistic updates
    var allMessages;
    
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    const {
        data: serverMessages = [],
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetMessagesInChatQuery(chatId);

    if (isSuccess) {
        // Combine server messages with local optimistic updates
        allMessages = [...Object.values(serverMessages["entities"]), ...localMessages];
    }

    const handleChange = (value) => {
        setMessage(value);
    }

    const handleSendMessage = async (chatId) => {
        if (!message.trim()) return;

        const newMessage = {
            _id: Date.now().toString(), // Temporary ID
            message: message,
            sender: { _id: "optimistic" }, // Temporary sender info
            createdAt: new Date().toISOString(),
            isOptimistic: true // Flag for optimistic message
        };

        // Optimistically add to local state
        setLocalMessages(prev => [...prev, newMessage]);
        setMessage(''); // Clear input

        try {
            await sendMessage({ message, chatId }).unwrap();
            // On success, remove the optimistic message (it will be replaced by the real one from server)
            setLocalMessages(prev => prev.filter(msg => msg._id !== newMessage._id));
        } catch (err) {
            console.error('Failed to send message:', err);
            // On error, remove the optimistic message
            setLocalMessages(prev => prev.filter(msg => msg._id !== newMessage._id));
        }
    };



    return (
        <div className="chat-container">
            <div className="chat-active">
                {/* Messages area */}
                <div className="messages-container">
                    {isLoading ? (
                        <div className="spinner-container">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="messages">
                            <ScrollableChat messages={allMessages} />
                        </div>
                    )}


                </div>
                <div className="input-container">
                    <input
                        type="text"
                        className="message-input"
                        placeholder="Message"
                        value={message}
                        onChange={(e) => handleChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage(chatId);
                                handleChange('');
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default SingleChat