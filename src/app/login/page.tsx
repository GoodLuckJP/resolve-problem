"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import "../../../styles/auth.css";
import GoogleSignInButton from "@/components/buttons/GoogleSignInButton";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!result?.error) {
      window.location.href = "/dashboard";
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="auth-container">
      <h1>ログイン</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <button type="submit">ログイン</button>
      </form>

      <div className="divider">
        <span>または</span>
      </div>

      <GoogleSignInButton />

      <p>
        アカウントをお持ちでないですか？{" "}
        <Link href="/register">新規会員登録</Link>
      </p>
    </div>
  );
}
