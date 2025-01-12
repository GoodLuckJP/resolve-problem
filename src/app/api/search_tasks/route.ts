import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    // PostgreSQL接続プール
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // 説明で一致するタスクを取得
    const descriptionResults = await pool.query(
      `
      SELECT tasks.id, tasks.title, tasks.description, NULL AS comment
      FROM tasks
      WHERE tasks.visibility = TRUE
      AND tasks.description ILIKE $1
      LIMIT 5
      `,
      [`%${query}%`]
    );

    // コメントで一致するタスクを取得
    const commentResults = await pool.query(
      `
      SELECT tasks.id, tasks.title, NULL AS description, comments.content AS comment
      FROM tasks
      LEFT JOIN comments ON tasks.id = comments.task_id
      WHERE tasks.visibility = TRUE
      AND comments.content ILIKE $1
      LIMIT 5
      `,
      [`%${query}%`]
    );

    // 重複を排除しユニークな結果を作成
    const combinedResults = [
      ...descriptionResults.rows,
      ...commentResults.rows,
    ];

    const uniqueResults = combinedResults.reduce((acc, current) => {
      const exists = acc.find((item: any) => item.id === current.id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    return NextResponse.json(uniqueResults);
  } catch (error) {
    console.error("検索エラー:", error);
    return NextResponse.json({ error: "検索に失敗しました" }, { status: 500 });
  }
}
