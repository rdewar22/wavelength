import { useState } from 'react';
import { MessagesSearchBar } from './MessagesSearchBar'; // Updated import path
import { useAccessChatMutation } from '../../components/messages/messagesApiSlice';
import { toast } from 'react-toastify';
import './NewConvoModal.css';

const NewConvoModal = ({
    toggleOverlay,
    toggleConversation,
    onCreateChat, // New prop for handling submission
    defaultChatName = "",
    overlayTitle = "New Conversation",
    overlayDescription = "Start a new conversation here."
}) => {
    const [groupChatName, setGroupChatName] = useState(defaultChatName);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const [accessChat, { isLoading: isAccessingChat }] = useAccessChatMutation();

    const handleSubmit = async () => {
        if (!selectedUsers) {
            toast.warning("Please select at least one user", {
                hideProgressBar: true,
                closeOnClick: true,
                autoClose: 3000,
                position: "top-center"
            });
            return;
        }

        try {
            // Prepare the request data
            const chatData = {
                groupName: groupChatName,
                userIds: selectedUsers.map(user => user._id) // Convert to array of user IDs
            };

            // Call the mutation
            const response = await accessChat(chatData).unwrap();

            // On success
            toast.success("Chat created successfully!", {
                closeOnClick: true,
                autoClose: 3000,
                position: "top-center"
            });

            // Get the chat title based on whether it's a direct message or group chat
            const chatTitle = selectedUsers.length === 1 ? selectedUsers[0].username : groupChatName;
            // Pass both the chat title and the new chat ID to toggleConversation
            toggleConversation(chatTitle, response._id);

            setGroupChatName('');
            setSelectedUsers([]);
            toggleOverlay();

        } catch (error) {
            toast.error(error.data?.message || "Failed to create chat", {
                closeOnClick: true,
                autoClose: 3000,
                position: "top-right"
            });
            console.error("Chat creation error:", error);
        }
    }

    return (
        <div className="overlay">
            <div className="overlay-content">
                <div className="modal-header">
                    <h2>{overlayTitle}</h2>
                    <button
                        className="close-button-x"
                        onClick={toggleOverlay}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
                <p>{overlayDescription}</p>

                {/* <input
                    type="text"
                    placeholder="Chat Name"
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                /> */}

                <MessagesSearchBar
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                />

                <button
                    onClick={handleSubmit}
                    className="create-chat-button"
                    disabled={selectedUsers.length === 0}
                >
                    Create Chat
                </button>
            </div>
        </div>
    );
};

export default NewConvoModal;