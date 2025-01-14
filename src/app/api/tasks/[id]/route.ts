import { decryptId } from "@/lib/crypto";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// 特定のタスクを取得 (GET)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = decryptId(id);

  try {
    const { rows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [
      taskId,
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = decryptId(id);
  const { title, description, visibility } = await req.json();

  try {
    const updateFields = [];
    const updateValues = [];
    let counter = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${counter}`);
      updateValues.push(title);
      counter++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${counter}`);
      updateValues.push(description);
      counter++;
    }

    if (visibility !== undefined) {
      updateFields.push(`visibility = $${counter}`);
      updateValues.push(visibility);
      counter++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    updateValues.push(taskId);
    const query = `
      UPDATE tasks 
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${counter}
      RETURNING *
    `;

    const { rows } = await pool.query(query, updateValues);
    return NextResponse.json(rows[0]);
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
