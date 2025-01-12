"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import "../../../styles/auth.css";
import GoogleSignInButton from "@/components/buttons/GoogleSignInButton";
import Link from "next/link";
import { redirect } from "next/navigation";

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

      if (!result?.error) {
        redirect("/dashboard");
      }
    } catch (error) {
      console.error("登録エラー:", error);
    }
  };

  return (
    <div className="auth-container">
      <h1>新規会員登録</h1>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          required
        />
        <button type="submit">登録</button>
      </form>
      <GoogleSignInButton />
      <p>
        すでにアカウントをお持ちですか？ <Link href="/login">ログイン</Link>
      </p>
    </div>
  );
}
