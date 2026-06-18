import { useState } from "react";
import "./search.css";

export default function Search({
  onSearch,
  onUseCurrentLocation,
    searchLoading,
}) {
  const [input, setInput] = useState("");

  const handleSearchClick = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    onSearch(trimmed);
    setInput("");
  };

  return (
  <div className="search-container">
    <div className="search-row">

      <input
        className="search-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search for city..."
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearchClick();
        }}
      />

      <button
        className="search-icon-btn"
        onClick={handleSearchClick}
        disabled={searchLoading}
      >
        🔍︎
      </button>

      <button
        className="search-icon-btn"
        onClick={onUseCurrentLocation}
        disabled={searchLoading}
      >
        🏠︎
      </button>

    </div>
  </div>
);
}