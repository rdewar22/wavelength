import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from "react-redux";
import ScrollableChat from './ScrollableChat';
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from "../../assets/animations/typing.json"
import { useGetMessagesInChatQuery, useSendMessageMutation, messagesApiSlice } from '../../components/messages/messagesApiSlice';
import "./SingleChat.css"
import { selectCurrentUserName, selectCurrentUserId } from '../auth/authSlice';
import socketManager from '../../components/messages/SocketManager';

const SingleChat = ({ chatId }) => {
    const dispatch = useDispatch();
    const [socketConnected, setSocketConnected] = useState(false);
    const userName = useSelector(selectCurrentUserName);
    const user = useSelector(state => state.auth.user);
    const userId = useSelector(selectCurrentUserId);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [sendMessage] = useSendMessageMutation();
    const messagesContainerRef = useRef();
    const connectionAttemptRef = useRef(false);

    const {
        data: messagesData,
        isLoading,
        isSuccess,
        isError,
        error,
    } = useGetMessagesInChatQuery(chatId);

    // Throttled scroll function
    const scrollToBottom = useCallback(() => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        }, 50); // Throttle scroll updates to 50ms
    }, []);

    // Load initial messages when chat changes or data is fetched
    useEffect(() => {
        if (isSuccess && messagesData) {
            setMessages(Object.values(messagesData.entities));
        }
    }, [isSuccess, messagesData, chatId]);

    // Initialize Socket.IO connection
    useEffect(() => {
        if (!userId || connectionAttemptRef.current) return; // Don't connect if no user ID or already attempting

        connectionAttemptRef.current = true;

        const connectSocket = async () => {
            try {
                await socketManager.connect(userId);
                setSocketConnected(true);
            } catch (error) {
                console.error("Failed to connect socket:", error);
                setSocketConnected(false);
            } finally {
                connectionAttemptRef.current = false;
            }
        };

        // Small delay to prevent rapid reconnections
        const timeoutId = setTimeout(() => {
            connectSocket();
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            connectionAttemptRef.current = false;
            setSocketConnected(false);
        };
    }, [userId]);

    // Join chat room when chatId changes
    useEffect(() => {
        if (chatId && socketConnected) {
            socketManager.joinRoom(chatId);
        }

        return () => {
            if (chatId) {
                socketManager.leaveRoom(chatId);
            }
        };
    }, [chatId, socketConnected]);

    // Optimized message handler using useCallback
    const handleNewMessage = useCallback((newMessageReceived) => {
        if (chatId === newMessageReceived.chat._id) {
            // Update local state
            setMessages(prevMessages => {
                // Check if message already exists to prevent duplicates
                const exists = prevMessages.some(msg => msg._id === newMessageReceived._id);
                if (exists) return prevMessages;
                
                return [...prevMessages, newMessageReceived];
            });

            // Update RTK Query cache for the current chat messages
            dispatch(
                messagesApiSlice.util.updateQueryData('getMessagesInChat', chatId, (draft) => {
                    // Check if message already exists in cache
                    const existsInCache = draft.entities[newMessageReceived._id];
                    if (!existsInCache) {
                        // Add the new message to the cache using entity adapter
                        draft.ids.push(newMessageReceived._id);
                        draft.entities[newMessageReceived._id] = newMessageReceived;
                    }
                })
            );

            // Update RTK Query cache for the chats list to update the latest message preview
            dispatch(
                messagesApiSlice.util.updateQueryData('fetchChatsForUser', userId, (draft) => {
                    const chatToUpdate = draft.entities[chatId];
                    if (chatToUpdate) {
                        chatToUpdate.latestMessage = {
                            _id: newMessageReceived._id,
                            message: newMessageReceived.message,
                            updatedAt: newMessageReceived.updatedAt || new Date().toISOString(),
                            sender: newMessageReceived.sender
                        };
                    }
                })
            );
        } else {
            // Message is for a different chat - still update the chat preview
            dispatch(
                messagesApiSlice.util.updateQueryData('fetchChatsForUser', userId, (draft) => {
                    const chatToUpdate = draft.entities[newMessageReceived.chat._id];
                    if (chatToUpdate) {
                        chatToUpdate.latestMessage = {
                            _id: newMessageReceived._id,
                            message: newMessageReceived.message,
                            updatedAt: newMessageReceived.updatedAt || new Date().toISOString(),
                            sender: newMessageReceived.sender
                        };
                    }
                })
            );
        }
    }, [chatId, dispatch, userId]);

    // Handle received messages and typing indicators
    useEffect(() => {
        if (!socketConnected || !chatId) return;

        // Create chat-specific event handlers
        const chatHandlers = {
            "message received": handleNewMessage,
            "typing": () => setIsTyping(true),
            "stop typing": () => setIsTyping(false)
        };

        // Register handlers for this specific chat
        socketManager.registerChatHandlers(chatId, chatHandlers);

        return () => {
            // Unregister handlers when component unmounts or chatId changes
            socketManager.unregisterChatHandlers(chatId);
        };
    }, [socketConnected, handleNewMessage, chatId]);

    // Scroll to bottom when messages change (throttled)
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Scroll to bottom when typing indicator appears (throttled)
    useEffect(() => {
        if (istyping) {
            scrollToBottom();
        }
    }, [istyping, scrollToBottom]);

    // Optimized typing handler
    const handleChange = useCallback((value) => {
        setMessage(value);

        if (!socketConnected || !socketManager.getSocket()?.connected) return;

        if (!typing) {
            setTyping(true);
            socketManager.getSocket().emit("typing", chatId);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (socketManager.getSocket()?.connected) {
                socketManager.getSocket().emit("stop typing", chatId);
            }
            setTyping(false);
        }, 3000);
    }, [socketConnected, typing, chatId]);

    // Optimized send message handler
    const handleSendMessage = useCallback(async (currentChatId) => {
        if (!message.trim()) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        if (socketManager.getSocket()?.connected) {
            socketManager.getSocket().emit("stop typing", currentChatId);
        }

        const tempMessage = {
            _id: `temp_${Date.now()}`,
            sender: {
                _id: userId,
                username: user?.username || userName,
                profilePicUri: user?.profilePicUri
            },
            message: message,
            chat: { _id: currentChatId }
        };

        try {
            setMessages(prevMessages => [...prevMessages, tempMessage]);
            setMessage('');

            const response = await sendMessage({ message, chatId: currentChatId }).unwrap();

            if (socketManager.getSocket()?.connected) {
                socketManager.getSocket().emit("new message", response);
            }

            // Replace temp message with real message
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
    }, [message, userId, user, userName, sendMessage]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="chat-container">
            <div className="chat-active">
                <div className="chat-messages-container" ref={messagesContainerRef}>
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
                                <div style={{ 
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    borderRadius: 5,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <Player
                                        src={animationData}
                                        autoplay
                                        loop
                                        style={{ height: 70, width: 70, marginBottom: 5, marginLeft: 0 }}
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