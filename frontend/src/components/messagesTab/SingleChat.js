import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from "react-redux";
import ScrollableChat from './ScrollableChat';
import ProfileModal from '../ProfileModal';
import Lottie from 'react-lottie';
import animationData from "../../animations/typing.json"
import { getSenderFull } from '../../config/ChatLogics';
import { selectAllMessages, selectMessagesResult, useGetMessagesInChatQuery, useSendMessageMutation } from '../../features/messages/messagesApiSlice';
import "./SingleChat.css"

const SingleChat = ({ chatId }) => {
    const [newMessage, setNewMessage] = useState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const [message, setMessage] = useState("");
    const [sendMessage] = useSendMessageMutation();
    const [localMessages, setLocalMessages] = useState([]);
    const messagesContainerRef = useRef();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    const {
        data,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetMessagesInChatQuery(chatId);

    const allMessages = useSelector(selectMessagesResult(chatId));

    useEffect(() => {
        // Scroll to bottom when messages load or change
        if (messagesContainerRef.current && isSuccess) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [isSuccess, allMessages]);

    const handleChange = (value) => {
        setMessage(value);
    }

    const handleSendMessage = async (chatId) => {
        if (!message.trim()) return;

        try {
            await sendMessage({ message, chatId }).unwrap();
            setMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-active">
                {/* Messages area */}
                <div className="messages-container" ref={messagesContainerRef}>
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