import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/auth";
import pool from "@/lib/db";

// メール一覧取得 (GET)
export async function GET() {
  const session = await getServerSession(authOptions); // セッション情報を取得

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: "ユーザーが認証されていません" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      "SELECT id, title, email, bcrypt_id FROM emails WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("メール一覧取得エラー:", error);
    return NextResponse.json(
      { error: "メール一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}
