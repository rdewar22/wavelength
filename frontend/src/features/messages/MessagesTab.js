import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { Link } from 'react-router-dom';
import { selectCurrentUser, selectCurrentUserId } from '../auth/authSlice';
import { useFetchChatsForUserQuery, useAccessChatMutation, useSendMessageMutation, messagesApiSlice } from './messagesApiSlice';
import './MessagesTab.css'
import ChatPreview from './ChatPreview';
import ProfileModal from '../../components/ui/ProfileModal';
import NewConvoModal from './NewConvoModal';
import SingleChat from './SingleChat';
import socketManager from './SocketManager';

export const MessagesTab = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const userId = useSelector(selectCurrentUserId);
    const [isOpen, setIsOpen] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showConversation, setShowConversation] = useState(false);
    const [currentConversationTitle, setCurrentConversationTitle] = useState('');
    const [currentConversationId, setCurrentConversationId] = useState('');

    const {
        data,
        isLoading,
        isSuccess,
        isError,
        error
    } = useFetchChatsForUserQuery(userId, {
        skip: !user || !userId
    });

    // Global message handler for all chats (not just the currently open one)
    const handleGlobalMessage = useCallback((newMessageReceived) => {
        // Always update the chat preview for any received message
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
    }, [dispatch, userId]);

    // Set up global socket listeners for the MessagesTab
    useEffect(() => {
        if (!userId) return;

        const connectAndSetupGlobalHandlers = async () => {
            try {
                await socketManager.connect(userId);
                
                // Register a global handler that doesn't conflict with SingleChat handlers
                const globalHandlers = {
                    "message received": handleGlobalMessage
                };

                // Use a special key for global handlers
                socketManager.registerChatHandlers('global_messages_tab', globalHandlers);
            } catch (error) {
                console.error("Failed to connect socket in MessagesTab:", error);
            }
        };

        connectAndSetupGlobalHandlers();

        return () => {
            // Cleanup global handlers when component unmounts
            socketManager.unregisterChatHandlers('global_messages_tab');
        };
    }, [userId, handleGlobalMessage]);

    const toggleMessagesTab = () => {
        setIsOpen(!isOpen);
    };

    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    };

    const toggleConversation = (convoTitle = null, chatId) => {

        setCurrentConversationTitle(convoTitle);
        setCurrentConversationId(chatId);
        setShowConversation(!showConversation);
    }

    let content;

    if (isLoading) {
        content = <p>Loading...</p>;
    } else if (isSuccess) {
        // Safely handle `data` (could be `null` or an array)
        const chatsArray = Object.values(data.entities);
        content = chatsArray
            .map(chat => (
                <ChatPreview
                    key={chat._id}
                    chatId={chat._id}
                    chatName={chat.chatName}
                    users={chat.users}
                    isGroupChat={chat.isGroupChat}
                    latestMessage={chat.latestMessage}
                    toggleConversation={toggleConversation}
                />
            ));
    } else if (isError) {
        content = <p>Error: {error.originalStatus} {error.status}</p>  //JSON.stringify()
    }

    return (
        <div className="messages-container">
            <div className={`messages-overlay ${isOpen ? "open" : ""}`}>
                <button className="messages-tab" onClick={toggleMessagesTab}>
                    Messages
                </button>
                {/* Messages content (hidden when closed) */}
                {user ? (
                    <>
                        {currentConversationId ? (
                            <div className="messages-content">
                                <div className='chat-header'>
                                    <button onClick={() => toggleConversation(null)} className="back-button">&lt;</button>
                                    <h3 className='message-recipient'>{currentConversationTitle}</h3>
                                    <ProfileModal userName={currentConversationTitle} />
                                </div>

                                <div className="message-scroll-container">
                                    <SingleChat chatId={currentConversationId} />
                                </div>
                            </div>
                        ) : (
                            <div className="messages-content">
                                <button onClick={toggleOverlay} className='new-convo-button'>+</button>
                                <ul>
                                    <section>
                                        {content?.length > 0 && content !== null ? (content) : (<p>Start a new chat with the '+' button!</p>)}
                                    </section>
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="messages-content">
                        <Link to='/login'>Login to view messages</Link>
                    </div>
                )}
            </div>

            {showOverlay && (
                <NewConvoModal
                    toggleOverlay={toggleOverlay}
                    toggleConversation={toggleConversation}
                />
            )}
        </div>
    );
}