import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useFindUsersQuery } from "../features/users/usersApiSlice";
import { IoPersonCircleOutline } from "react-icons/io5";
import { Toaster } from "@chakra-ui/react"
import UserBadgeItem from "./UserBadgeItem.js"
import "./SearchBar.css";


export const MessagesSearchBar = ( { toggleConversation, toggleOverlay}) => {
    const [input, setInput] = useState("")
    const [debouncedInput, setDebouncedInput] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    let { data, isLoading, error } = useFindUsersQuery(debouncedInput, {
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

    const handleLinkClick = (username) => {
        setInput('');  // Clear the input field when a link is clicked
        toggleOverlay();
        toggleConversation(username);
    };

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
        if (selectedUsers.includes(userToAdd)) {
            Toaster.create({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleDelete = () => {};

    return (
        <>
            <div className="search-container">
                <div className="input-wrapper">
                    <FaSearch id="search-icon" />
                    <input onBlur={handleBlur} onFocus={handleFocus} type="text" className="search-input" placeholder="Search" value={input} onChange={(e) => handleChange(e.target.value)} />
                    {selectedUsers.map(u => (
                        <UserBadgeItem key={u._id} user={u}
                        handleFunction={()=>handleDelete(u)} />
                    ))}
                </div>
                <div className="dropdown">
                    {input.length > 0 && isFocused === true ? (
                        data?.map((user) => (
                            <div key={user.username} className="dropdown-row">
                                {user.profilePicUri ? (
                                    <img src={user.profilePicUri} alt={`${user.username} avatar`} className="prof-pic" />
                                ) : (
                                    <IoPersonCircleOutline />
                                )}
                                
                                <Link onClick={handleGroup}>{user.username}</Link>
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
