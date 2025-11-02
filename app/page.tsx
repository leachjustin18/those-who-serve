"use client";

import { signIn } from "next-auth/react";

const handleSignIn = () => {
  void signIn("google");
};

export default function Home() {
  return (
    <main>
      Hello
      <button onClick={handleSignIn}>Sign In</button>
    </main>
  );
}
