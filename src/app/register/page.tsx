"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import "../../../styles/auth.css";
import GoogleSignInButton from "@/components/buttons/GoogleSignInButton";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await signIn("register", {
        redirect: false,
        email,
        password,
      });

      if (result?.ok) {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("登録エラー:", error);
    }
  };

  return (
    <div className="auth-container">
      <h1>新規会員登録</h1>
      <form onSubmit={handleRegister}>
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
        <button type="submit">登録</button>
      </form>

      <div className="divider">
        <span>または</span>
      </div>

      <GoogleSignInButton />

      <p>
        すでにアカウントをお持ちですか？ <Link href="/login">ログイン</Link>
      </p>
    </div>
  );
}
