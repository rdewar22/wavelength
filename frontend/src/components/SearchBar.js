import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useFindUsersQuery } from "../features/users/usersApiSlice";
import "./SearchBar.css";


export const SearchBar = () => {
    const [input, setInput] = useState("")
    const [debouncedInput, setDebouncedInput] = useState("");

    console.log("debounced Input:", debouncedInput);
    const { data, isLoading, error } = useFindUsersQuery(debouncedInput, {
        skip: !debouncedInput,  // Skip query if input is empty
    });

    // Debounce the input value
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedInput(input);
        }, 200); // Wait 200ms after last keystroke before updating

        // Cleanup timeout
        return () => clearTimeout(timeoutId);
    }, [input]);

    const handleChange = (value) => {
        setInput(value);

    }

    return (
        <div className="input-wrapper">
            <FaSearch id="search-icon" />
            <input className="search-input" placeholder="Type to search..." value={input} onChange={(e) => handleChange(e.target.value)} />
        </div>
    )
}
