import "./header.css";
import { useState, useEffect, useRef } from "react";
import { auth } from "../../firebase";

import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

import Search from "../search/Search";

export default function Header({
  onSearch,
  onUseCurrentLocation,
  onSavedClick,
}) {
  const [user, setUser] = useState(null);

  const accountRef = useRef(null);
  const searchRef = useRef(null);

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // AUTH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return unsubscribe;
  }, []);

  // OUTSIDE CLICK (FIXED)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideAccount =
        accountRef.current &&
        !accountRef.current.contains(event.target);

      const clickedOutsideSearch =
        searchRef.current &&
        !searchRef.current.contains(event.target);

      if (clickedOutsideAccount) {
        setShowAccountMenu(false);
      }

      if (clickedOutsideSearch) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AUTH ACTIONS
  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      await signInWithPopup(auth, provider);
      setShowAccountMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowAccountMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="header">
      {/* LEFT */}
      <div className="header-left">
        <h1 className="logo">🌤️ Weather App</h1>
      </div>

      <div className="header-center" />

      {/* RIGHT */}
      <div className="header-right">
        {/* SEARCH */}
        <div className="search-wrapper" ref={searchRef}>
          <button
            className="header-btn"
            onClick={() => setShowSearch(true)}
          >
            🔍 Search
          </button>

          {showSearch && (
            <div className="search-dropdown">
              <Search
                onSearch={(city) => {
                  onSearch(city);
                  setShowSearch(false);
                }}
                onUseCurrentLocation={() => {
                  onUseCurrentLocation();
                  setShowSearch(false);
                }}
                onClose={() => setShowSearch(false)}
              />
            </div>
          )}
        </div>

        {/* SAVED */}
        <button className="header-btn" onClick={onSavedClick}>
          ⭐ Saved
        </button>

        {/* ACCOUNT */}
        <div className="account-wrapper" ref={accountRef}>
          <button
            className="header-btn"
            onClick={() => setShowAccountMenu((p) => !p)}
          >
            👤 Account
          </button>

          {showAccountMenu && (
            <div className="account-dropdown">
              {user ? (
                <>
                  <p className="account-label">Logged in as</p>
                  <p className="account-name">
                    {user.displayName || user.email}
                  </p>

                  <button
                    className="account-action"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <p className="account-label">Not signed in</p>

                  <button
                    className="account-action"
                    onClick={handleSignIn}
                  >
                    Sign In with Google
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}