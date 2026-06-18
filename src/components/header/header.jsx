import "./header.css";

import { useState, useEffect, useRef } from "react";
import { auth } from "../../firebase";

import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

export default function Header({
  onSearchClick,
  onSavedClick,
}) {
  const [user, setUser] = useState(null);
  const accountRef = useRef(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return unsubscribe;
  }, []);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      accountRef.current &&
      !accountRef.current.contains(event.target)
    ) {
      setShowAccountMenu(false);
    }
  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, []);


const handleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account",
    });

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

       <div
  className="account-wrapper"
  ref={accountRef}
>

          <button
            className="header-btn"
            onClick={() =>
              setShowAccountMenu((prev) => !prev)
            }
          >
            👤 Account
          </button>

          {showAccountMenu && (
            <div className="account-dropdown">

              {user ? (
                <>
                  <p className="account-label">
                    Logged in as
                  </p>

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
                  <p className="account-label">
                    Not signed in
                  </p>

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