import { decryptId } from "@/lib/crypto";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// コメント取得 (GET)
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("task_id");
  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  const taskId = decryptId(id);

  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.content, c.created_at 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.task_id = $1 
       ORDER BY c.created_at ASC`,
      [taskId]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// コメント投稿 (POST)
export async function POST(req: NextRequest) {
  const { task_id, user_id, content } = await req.json();

  const decodedTaskId = decodeURIComponent(task_id);
  const id = decryptId(decodedTaskId);

  if (!id || !user_id || !content) {
    return NextResponse.json(
      { error: "Task ID, User ID, and content are required" },
      { status: 400 }
    );
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO comments (task_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [id, user_id, content]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Failed to post comment:", error);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    );
  }
}
