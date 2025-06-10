import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useFindUserQuery } from "../features/users/usersApiSlice";
import { IoPersonCircleOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import UserBadgeItem from "./UserBadgeItem.js"
import "./SearchBar.css";


export const MessagesSearchBar = ({ selectedUsers, setSelectedUsers }) => {
    const [input, setInput] = useState("") // search input
    const [debouncedInput, setDebouncedInput] = useState(""); // what does debounced mean?
    const [isFocused, setIsFocused] = useState(false); // idk what this does
    let { data, isLoading, error } = useFindUserQuery(debouncedInput, {
        //skip: !debouncedInput,  // Skip query if input is empty
    });

    // Debounce the input value
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedInput(input);
        }, 50); // Wait 50ms after last keystroke before updating


        // Cleanup timeout
        return () => clearTimeout(timeoutId);
    }, [input]);

    const handleChange = (value) => {
        data = []
        setInput(value);
    }


    const handleBlur = () => {
        // Delay the blur event to allow the link to be clicked
        setTimeout(() => {
            setIsFocused(false);
        }, 175); // Adjust the delay as needed
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleGroup = (userToAdd) => {
        if (selectedUsers.length === 1) {
            toast.warning("You can only add one user to a chat", {
                hideProgressBar: true,
                closeOnClick: true,
                autoClose: 3000,
                position: "top-center"
            });
            return;
        }
        if (selectedUsers.includes(userToAdd)) {
            toast.warning("User already added", {
                hideProgressBar: true,
                closeOnClick: true,
                autoClose: 3000,
                position: "top-center"
            });
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
        setInput(''); // Clear the input after adding user
        setIsFocused(false); // Hide dropdown
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id))
    };

    return (
        <>
            <div className="search-container">
                <div className="input-wrapper">
                    <FaSearch id="search-icon" />
                    <input onBlur={handleBlur} onFocus={handleFocus} type="text" className="search-input" placeholder="Search Users" value={input} onChange={(e) => handleChange(e.target.value)} />

                </div>
                <div>
                    {selectedUsers.map(u => (
                        <UserBadgeItem key={u._id} user={u}
                            handleFunction={() => handleDelete(u)} />
                    ))}
                </div>
                {/* && isFocused === true  */}
                <div className="dropdown">
                    {input.length > 0 ? (
                        data?.map((user) => (
                            <div 
                                key={user.username} 
                                className="dropdown-row"
                                onClick={() => handleGroup(user)}
                                style={{ cursor: 'pointer' }}
                            >
                                {user.profilePicUri ? (
                                    <img src={user.profilePicUri} alt={`${user.username} avatar`} className="prof-pic" />
                                ) : (
                                    <IoPersonCircleOutline size="1.8em" />
                                )}

                                <span>{user.username}</span>
                            </div>
                        ))
                    ) : (
                        !isLoading
                    )}
                </div>
            </div>

        </>
    )
}
