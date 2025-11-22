"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      return;
    }

    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Email"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
      />
      <button type="submit">Create account</button>
    </form>
  );
}
