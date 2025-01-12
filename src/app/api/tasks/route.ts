import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { authOptions } from "../auth/[...nextauth]/route";

// PostgreSQL接続プール
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// すべてのタスクを取得 (GET)
export async function GET() {
  const session = await getServerSession(authOptions); // セッション情報を取得

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: "ユーザーが認証されていません" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT tasks.*, users.email AS user_email 
       FROM tasks 
       JOIN users ON tasks.user_id = users.id 
       WHERE user_id = $1 
       ORDER BY tasks.created_at DESC`,
      [userId]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// 新しいタスクを作成 (POST)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions); // セッション情報を取得

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: "ユーザーが認証されていません" },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const { title, description, status } = await req.json();

  try {
    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, user_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [title, description, status, userId]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
