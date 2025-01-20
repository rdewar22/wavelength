import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";


export const SearchBar = () => {
    const [input, setInput] = useState("")

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
