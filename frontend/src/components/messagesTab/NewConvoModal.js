import { useState } from 'react';
import { MessagesSearchBar } from '../MessagesSearchBar'; // Adjust import path as needed
import { useAccessChatMutation } from '../../features/messages/messagesApiSlice';
import { toast } from 'react-toastify';

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
        if (!groupChatName || !selectedUsers) {
            toast.warning("Please fill all the fields", {
                hideProgressBar: true,
                isClosable: true,
                position: "top",
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
            await accessChat(chatData).unwrap();

            // On success
            toast.success("Chat created successfully!");
            setGroupChatName('');
            setSelectedUsers([]);
            toggleOverlay();


        } catch (error) {
            toast.error(error.data?.message || "Failed to create chat");
            console.error("Chat creation error:", error);
        }
    }

    return (
        <div className="overlay">
            <div className="overlay-content">
                <h2>{overlayTitle}</h2>
                <p>{overlayDescription}</p>

                <input
                    type="text"
                    placeholder="Chat Name"
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                />

                <MessagesSearchBar
                    toggleConversation={toggleConversation}
                    toggleOverlay={toggleOverlay}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                />

                <button
                    onClick={handleSubmit}
                    className="close-button"
                    disabled={!groupChatName || selectedUsers.length === 0}
                >
                    Create Chat
                </button>
            </div>
        </div>
    );
};

export default NewConvoModal;