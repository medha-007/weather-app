import { useState } from "react";
import "./search.css";

export default function Search({
  onClose,
  onSearch,
  onUseCurrentLocation,
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
      <h2 className="search-title">🔍 Search Location</h2>

      <input
        className="search-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter city name..."
      />

      <div className="search-actions">
        <button className="search-btn primary" onClick={handleSearchClick}>
          Search
        </button>

        <button
          className="search-btn secondary"
          onClick={onUseCurrentLocation}
        >
          📍 Use Current Location
        </button>

        <button className="search-btn ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}