import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSelector } from "react-redux";
import ScrollableChat from './ScrollableChat';
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from "../../assets/animations/typing.json"
import { useGetMessagesInChatQuery, useSendMessageMutation } from './messagesApiSlice';
import "./SingleChat.css"
import io from "socket.io-client";
import { selectCurrentUser, selectCurrentUserId } from '../auth/authSlice';

const ENDPOINT = "http://localhost:3500";

// Singleton socket manager to prevent multiple connections
class SocketManager {
    constructor() {
        this.socket = null;
        this.isConnecting = false;
        this.isConnected = false;
        this.eventHandlers = new Map(); // Track event handlers per chatId
        this.setupPromise = null;
        this.connectedRooms = new Set(); // Track joined rooms
    }

    async connect(userId) {
        if (this.socket && this.isConnected) {
            return this.socket;
        }

        if (this.isConnecting) {
            return this.setupPromise;
        }

        this.isConnecting = true;
        
        // Clean up existing connection
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        this.setupPromise = new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Connection timeout'));
                this.isConnecting = false;
            }, 10000);

            this.socket = io(ENDPOINT, {
                withCredentials: true,
                transports: ['websocket'],
                forceNew: true,
                timeout: 5000,
            });

            this.socket.on("connect", () => {
                clearTimeout(timeoutId);
                console.log("Socket connected successfully");
                this.socket.emit("setup", { _id: userId });
            });

            this.socket.on("connected", () => {
                this.isConnected = true;
                this.isConnecting = false;
                console.log("Socket setup complete");
                resolve(this.socket);
            });

            this.socket.on("connect_error", (error) => {
                clearTimeout(timeoutId);
                console.error("Socket connection error:", error);
                this.isConnecting = false;
                reject(error);
            });

            this.socket.on("disconnect", (reason) => {
                console.log("Socket disconnected:", reason);
                this.isConnected = false;
                this.isConnecting = false;
                this.connectedRooms.clear();
            });
        });

        try {
            await this.setupPromise;
            return this.socket;
        } catch (error) {
            this.isConnecting = false;
            throw error;
        }
    }

    // Register event handlers for a specific chat
    registerChatHandlers(chatId, handlers) {
        if (!this.socket || !this.isConnected) return;

        // Remove existing handlers for this chat
        this.unregisterChatHandlers(chatId);

        // Store handlers for this chat
        this.eventHandlers.set(chatId, handlers);

        // Register with socket
        Object.entries(handlers).forEach(([event, handler]) => {
            this.socket.on(event, handler);
        });
    }

    // Unregister event handlers for a specific chat
    unregisterChatHandlers(chatId) {
        if (!this.socket || !this.eventHandlers.has(chatId)) return;

        const handlers = this.eventHandlers.get(chatId);
        Object.entries(handlers).forEach(([event, handler]) => {
            this.socket.off(event, handler);
        });

        this.eventHandlers.delete(chatId);
    }

    // Join a chat room
    joinRoom(chatId) {
        if (this.socket && this.isConnected && !this.connectedRooms.has(chatId)) {
            this.socket.emit("join chat", chatId);
            this.connectedRooms.add(chatId);
            console.log(`Joined chat room: ${chatId}`);
        }
    }

    // Leave a chat room (optional, rooms are cleaned up on disconnect)
    leaveRoom(chatId) {
        if (this.socket && this.connectedRooms.has(chatId)) {
            // Socket.IO doesn't have a leave method, but we can track locally
            this.connectedRooms.delete(chatId);
            console.log(`Left chat room: ${chatId}`);
        }
    }

    getSocket() {
        return this.socket;
    }

    isSocketConnected() {
        return this.socket && this.isConnected;
    }

    disconnect() {
        if (this.socket) {
            // Clear all event handlers
            this.eventHandlers.clear();
            this.connectedRooms.clear();
            
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.isConnecting = false;
        }
    }
}

// Global socket manager instance
const socketManager = new SocketManager();

const SingleChat = ({ chatId }) => {
    const [socketConnected, setSocketConnected] = useState(false);
    const userName = useSelector(selectCurrentUser);
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
            setMessages(prevMessages => {
                // Check if message already exists to prevent duplicates
                const exists = prevMessages.some(msg => msg._id === newMessageReceived._id);
                if (exists) return prevMessages;
                
                return [...prevMessages, newMessageReceived];
            });
        }
    }, [chatId]);

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
                            {true && (
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