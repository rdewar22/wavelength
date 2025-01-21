import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useFindUsersQuery } from "../features/users/usersApiSlice";
import "./SearchBar.css";


export const SearchBar = () => {
    const [input, setInput] = useState("")
    const [debouncedInput, setDebouncedInput] = useState("");


    let { data, isLoading, error } = useFindUsersQuery(debouncedInput, {
        //skip: !debouncedInput,  // Skip query if input is empty
    });

    
    

    // Debounce the input value
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedInput(input);
        }, 50); // Wait 200ms after last keystroke before updating


        // Cleanup timeout
        return () => clearTimeout(timeoutId);
    }, [input]);

    const handleChange = (value) => {
        data = []
        setInput(value);
    }

    return (
        <>
            <div className="search-container">
                <div className="input-wrapper">
                    <FaSearch id="search-icon" />
                    <input type="text" className="search-input" placeholder="Search" value={input} onChange={(e) => handleChange(e.target.value)} />
                </div>
                <div className="dropdown">
                    {input.length > 0 ? (
                        data?.map((user) => (
                            <div key={user.username} className="dropdown-row">
                                {user.username}
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
