import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/auth";
import pool from "@/lib/db";
import { encryptId } from "@/lib/crypto";

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
  const { title, description } = await req.json();

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, user_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [title, description, userId]
    );

    const insertedId = result.rows[0].id;
    const bcryptId = encryptId(insertedId);
    await pool.query(`UPDATE tasks SET bcrypt_id = $1 WHERE id = $2`, [
      bcryptId,
      insertedId,
    ]);

    const { rows } = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [
      insertedId,
    ]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
