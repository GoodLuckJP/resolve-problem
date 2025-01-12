import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// PostgreSQL接続プール
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 特定のタスクを取得 (GET)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const { rows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// タスクを更新 (PUT)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const { title, description, status, visibility } = await req.json();

  try {
    const { rows } = await pool.query(
      `UPDATE tasks 
       SET title = $1, description = $2, status = $3, visibility = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING *`,
      [title, description, status, visibility, id]
    );
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// タスクを削除 (DELETE)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
