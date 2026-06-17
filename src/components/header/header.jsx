import "./header.css";

export default function Header({
  onSearchClick,
  onSavedClick,
  onAccountClick,
}) {
  return (
    <header className="header">

      <div className="header-left">
        <h1 className="logo">🌤️ Weather App</h1>
      </div>

      <div className="header-center" />

      <div className="header-right">

        <button
          className="header-btn"
          onClick={onSearchClick}
        >
          🔍 Search
        </button>

        <button
          className="header-btn"
          onClick={onSavedClick}
        >
          ⭐ Saved
        </button>

        <button
          className="header-btn"
          onClick={onAccountClick}
        >
          👤 Account
        </button>

      </div>

    </header>
  );
}