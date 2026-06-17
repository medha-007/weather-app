import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase";

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account",
});

export async function loginUser() {
  const result = await signInWithPopup(
    auth,
    provider
  );

  const user = result.user;

  await fetch(
    "http://localhost:3000/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
      }),
    }
  );

  return user;
}

export async function logoutUser() {
  await signOut(auth);
}