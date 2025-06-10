import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useFindUserQuery } from "../features/users/usersApiSlice";
import { IoPersonCircleOutline } from "react-icons/io5";
import "./SearchBar.css";


export const SearchBar = () => {
    const [input, setInput] = useState("")
    const [debouncedInput, setDebouncedInput] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Skip query if input is too short or empty
    const shouldSkipQuery = !debouncedInput;

    let { data, isLoading, error } = useFindUserQuery(debouncedInput, {
        skip: shouldSkipQuery,
    });

    // Memoize the data to prevent unnecessary re-renders
    const memoizedData = useMemo(() => {
        return data || [];
    }, [data]);

    // Increase debounce time to reduce API calls
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedInput(input);
        }, 300); // Increased from 50ms to 300ms

        // Cleanup timeout
        return () => clearTimeout(timeoutId);
    }, [input]);

    const handleChange = (value) => {
        setInput(value);
    }

    const handleLinkClick = () => {
        setInput('');
        setIsFocused(false);
    };

    const handleBlur = () => {
        // Delay the blur event to allow the link to be clicked
        setTimeout(() => {
            setIsFocused(false);
        }, 175);
    };
    
    const handleFocus = () => {
        setIsFocused(true);
    };

    return (
        <>
            <div className="search-container">
                <div className="input-wrapper">
                    <FaSearch id="search-icon" />
                    <input 
                        onBlur={handleBlur} 
                        onFocus={handleFocus} 
                        type="text" 
                        className="search-input" 
                        placeholder="Search users..." 
                        value={input} 
                        onChange={(e) => handleChange(e.target.value)} 
                    />
                </div>
                <div className="dropdown">
                    {input.length >= 2 && isFocused && !isLoading && memoizedData.length > 0 ? (
                        memoizedData.map((user) => (
                            <div key={user._id} className="dropdown-row">
                                {user.profilePicUri ? (
                                    <img src={user.profilePicUri} alt={`${user.username} avatar`} className="prof-pic" />
                                ) : (
                                    <IoPersonCircleOutline />
                                )}
                                
                                <Link 
                                    to={`/publicprofile/${user.username}`} 
                                    state={{ publicUserId: user._id }} 
                                    onClick={handleLinkClick}
                                >
                                    {user.username}
                                </Link>
                            </div>
                        ))
                    ) : input.length >= 2 && isFocused && isLoading ? (
                        <div className="dropdown-row">
                            <span>Searching...</span>
                        </div>
                    ) : input.length >= 2 && isFocused && !isLoading && memoizedData.length === 0 ? (
                        <div className="dropdown-row">
                            <span>No users found</span>
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    )
}
