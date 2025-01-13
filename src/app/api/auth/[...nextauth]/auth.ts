import NextAuth, { User } from "next-auth";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { Account, Profile } from "next-auth";
import { JWT, Session } from "@/type/auth";

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
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        if (!credentials) {
          throw new Error("資格情報が提供されていません");
        }
        const { email, password } = credentials;

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

          return { id: String(user.id), email: user.email };
        } catch (error) {
          console.error(error);
          throw new Error("認証に失敗しました");
        }
      },
    }),
    CredentialsProvider({
      id: "register",
      name: "Register",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("資格情報が提供されていません");
        }
        const { email, password } = credentials;

        try {
          // ユーザーの存在確認
          const checkQuery = "SELECT * FROM users WHERE email = $1";
          const existingUser = await pool.query(checkQuery, [email]);

          if (existingUser.rows.length > 0) {
            throw new Error("既に登録済みのメールアドレスです");
          }

          // パスワードをハッシュ化
          const hashedPassword = await bcrypt.hash(password, 10);

          // ユーザーをデータベースに登録
          const insertQuery = `
            INSERT INTO users (email, password, provider)
            VALUES ($1, $2, 'register') RETURNING id, email
          `;
          const newUser = await pool.query(insertQuery, [
            email,
            hashedPassword,
          ]);

          // 登録後のユーザー情報を返す
          return {
            id: String(newUser.rows[0].id),
            email: newUser.rows[0].email,
          };
        } catch (error) {
          console.error("登録エラー:", error);
          throw new Error("登録に失敗しました");
        }
      },
    }),
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
      token: JWT;
      account: Account | null;
      profile?: Profile;
      user?: User;
    }) {
      if (account?.provider === "google" && profile) {
        const email = profile.email!;
        const provider = account.provider;
        const providerId = account.providerAccountId;

        try {
          const existingUserQuery = "SELECT * FROM users WHERE email = $1";
          const existingUser = await pool.query(existingUserQuery, [email]);

          if (existingUser.rows.length === 0) {
            const insertUserQuery = `
              INSERT INTO users (email, provider, provider_id) 
              VALUES ($1, $2, $3) RETURNING id, email
            `;
            const newUser = await pool.query(insertUserQuery, [
              email,
              provider,
              providerId,
            ]);

            token.id = newUser.rows[0].id;
          } else {
            token.id = existingUser.rows[0].id;
          }
        } catch (error) {
          console.error("Googleユーザー登録エラー:", error);
        }
      }

      if (user && !token.id) {
        token.id = Number(user.id);
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = { id: String(token.id), email: token.email! };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
