import { useState } from "react";
import "./search.css";

export default function Search({
  onSearch,
  onUseCurrentLocation,
  searchLoading,
  recentSearches,
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

    {recentSearches?.length > 0 && (
      <div className="recent-searches">
        {recentSearches.map((search) => (
  <button
    key={search._id}
    className="recent-chip"
    onClick={() => setInput(search.city)}
  >
    {search.city}
  </button>
))}
      </div>
    )}

  </div>
);
}