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
          placeholder="Enter city..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchClick();
            }
          }}
        />

        <div className="search-actions">

  <button
    className="search-btn"
    onClick={handleSearchClick}
    disabled={searchLoading}
  >
    {searchLoading ? "Loading..." : "🔍"}
  </button>

  <button
    className="search-btn"
    onClick={onUseCurrentLocation}
    disabled={searchLoading}
  >
    📍
  </button>

</div>

      </div>
    </div>
  );
}