import io from "socket.io-client";

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

export default socketManager; 