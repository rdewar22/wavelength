import { useState } from 'react';
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import { selectCurrentUser, selectCurrentUserId } from '../auth/authSlice';
import { useFetchChatsForUserQuery, useAccessChatMutation, useSendMessageMutation } from './messagesApiSlice';
import './MessagesTab.css'
import ChatPreview from './ChatPreview';
import ProfileModal from '../../components/ui/ProfileModal';
import NewConvoModal from './NewConvoModal';
import SingleChat from './SingleChat';

export const MessagesTab = () => {
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
                    <div className="no-user-message">
                        <p>
                            Please <Link to="/login" className='login-link'>login</Link> or <Link className='register-link' to="/register">register</Link> to use messages.
                        </p>
                    </div>
                )}

            </div>

            {/* Overlay for new conversation modal */}
            {showOverlay && (
                <NewConvoModal
                    toggleOverlay={toggleOverlay}
                    toggleConversation={toggleConversation}
                />
            )}
        </div>
    );
};