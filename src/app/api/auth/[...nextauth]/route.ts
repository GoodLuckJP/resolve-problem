import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials!;

        try {
          const query = "SELECT * FROM users WHERE email = $1";
          const result = await pool.query(query, [email]);

          if (result.rows.length === 0) {
            throw new Error("ユーザーが見つかりません");
          }

          const user = result.rows[0];
          const isValid = await bcrypt.compare(password, user.password);

          if (!isValid) {
            throw new Error("パスワードが間違っています");
          }

          return {
            id: user.id,
            email: user.email,
          };
        } catch (error: any) {
          throw new Error(error.message || "認証に失敗しました");
        }
      },
    }),
    {
      id: "register",
      name: "Register",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials!;

        try {
          // ユーザーの存在確認
          const checkQuery = "SELECT * FROM users WHERE email = $1";
          const existingUser = await pool.query(checkQuery, [email]);

          if (existingUser.rows.length > 0) {
            throw new Error("既に登録済みのメールアドレスです");
          }

          // パスワードをハッシュ化
          const hashedPassword = await bcrypt.hash(password, 10);

          // 新規ユーザー登録
          const insertQuery = `
            INSERT INTO users (email, password, provider)
            VALUES ($1, $2, 'register') RETURNING id, email
          `;
          const newUser = await pool.query(insertQuery, [
            email,
            hashedPassword,
          ]);

          return { id: newUser.rows[0].id, email: newUser.rows[0].email };
        } catch (error: any) {
          throw new Error(error.message || "登録に失敗しました");
        }
      },
    },
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({
      token,
      account,
      profile,
      user,
    }: {
      token: any;
      account?: any;
      profile?: any;
      user?: any;
    }) {
      // Googleユーザーの新規登録処理
      if (account?.provider === "google" && profile) {
        const email = profile.email!;
        const provider = account.provider;
        const providerId = account.providerAccountId;

        try {
          // データベースでユーザーを確認
          const existingUserQuery = "SELECT * FROM users WHERE email = $1";
          const existingUser = await pool.query(existingUserQuery, [email]);

          if (existingUser.rows.length === 0) {
            // ユーザーが存在しない場合、新規登録
            const insertUserQuery = `
              INSERT INTO users (email, provider, provider_id) 
              VALUES ($1, $2, $3) RETURNING id, email
            `;
            const newUser = await pool.query(insertUserQuery, [
              email,
              provider,
              providerId,
            ]);

            token.id = newUser.rows[0].id; // トークンに新しいユーザーIDを設定
          } else {
            // 既存ユーザーの場合、ユーザーIDをトークンに設定
            token.id = existingUser.rows[0].id;
          }
        } catch (error) {
          console.error("Googleユーザー登録エラー:", error);
        }
      }

      if (user && !token.id) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user = { ...session.user, id: token.id };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
