import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from "react-redux";
import ScrollableChat from './ScrollableChat';
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from "../../animations/typing.json"
import { useGetMessagesInChatQuery, useSendMessageMutation } from '../../features/messages/messagesApiSlice';
import "./SingleChat.css"
import io from "socket.io-client";
import { selectCurrentUser, selectCurrentUserId } from '../../features/auth/authSlice';

const ENDPOINT = "http://localhost:3500";
let socket;

const SingleChat = ({ chatId }) => {
    const [socketConnected, setSocketConnected] = useState(false);
    const userName = useSelector(selectCurrentUser);
    const user = useSelector(state => state.auth.user);
    const userId = useSelector(selectCurrentUserId);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [sendMessage] = useSendMessageMutation();
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
        data: messagesData,
        isLoading,
        isSuccess,
        isError,
        error,
    } = useGetMessagesInChatQuery(chatId);

    // Load initial messages when chat changes or data is fetched
    useEffect(() => {
        if (isSuccess && messagesData) {
            // console.log("Setting initial messages:", messagesData);
            setMessages(Object.values(messagesData.entities));
        }
    }, [isSuccess, messagesData, chatId]);

    // Initialize Socket.IO connection
    useEffect(() => {
        socket = io(ENDPOINT, {
            withCredentials: true
        });

        socket.on("connect", () => {
            // console.log("Socket connected with ID:", socket.id);
            socket.emit("setup", { _id: userId }); // Use userId instead of user
        });

        socket.on("connected", () => {
            // console.log("Socket setup completed");
            setSocketConnected(true);
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        return () => {
            socket.off("connect");
            socket.off("connected");
            socket.off("connect_error");
            socket.disconnect();
        };
    }, [userId]);

    // Join chat room when chatId changes
    useEffect(() => {
        if (chatId && socket && socketConnected) {
            socket.emit("join chat", chatId);
        }
    }, [chatId, socketConnected]);

    // Handle received messages and typing indicators
    useEffect(() => {
        if (!socket || !socketConnected) return;

        const handleNewMessage = (newMessageReceived) => {

            if (chatId === newMessageReceived.chat._id) {
                setMessages(prevMessages => [...prevMessages, newMessageReceived]);
            } else {
                // console.log("Message was for a different chat");
            }
        };

        socket.on("message received", handleNewMessage);
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        return () => {
            socket.off("message received", handleNewMessage);
            socket.off("typing");
            socket.off("stop typing");
        };
    }, [socketConnected, chatId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Scroll to bottom when typing indicator appears
    useEffect(() => {
        if (istyping && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [istyping]);

    const handleChange = (value) => {
        setMessage(value);

        // Handle typing indicator
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", chatId);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop typing", chatId);
            setTyping(false);
        }, 3000);
    }

    const handleSendMessage = async (chatId) => {
        if (!message.trim()) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        socket.emit("stop typing", chatId);

        const tempMessage = {
            _id: Date.now(),
            sender: {
                _id: userId,
                username: user?.username || userName,
                profilePicUri: user?.profilePicUri
            },
            message: message,
            chat: { _id: chatId }
        };

        try {
            setMessages(prevMessages => [...prevMessages, tempMessage]);
            setMessage('');

            const response = await sendMessage({ message, chatId }).unwrap();

            socket.emit("new message", response);

            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg._id === tempMessage._id ? response : msg
                )
            );
        } catch (err) {
            console.error('Failed to send message:', err);
            setMessages(prevMessages =>
                prevMessages.filter(msg => msg._id !== tempMessage._id)
            );
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-active">
                <div className="messages-container" ref={messagesContainerRef}>
                    {isLoading ? (
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    ) : isError ? (
                        <div className="error-container">
                            <p>Error loading messages. Please try again later.</p>
                        </div>
                    ) : (
                        <div className="messages">
                            <ScrollableChat messages={messages} />
                            {istyping && (
                                <div style={{ marginLeft: 10 }}>
                                    <Player
                                        src={animationData}
                                        autoplay
                                        loop
                                        style={{ width: 70, marginBottom: 15, marginLeft: 0 }}
                                    />
                                </div>
                            )}
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
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default SingleChat