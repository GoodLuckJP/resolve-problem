import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const TEMPLATE_TYPES = {
  SPECIFICATION: { id: "1", name: "仕様の段階の質問" },
  DEVELOPMENT: { id: "2", name: "開発での質問" },
};

// メール詳細取得
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const emailId = (await context.params)?.id; // params.id を安全に取得
  if (!emailId) {
    return NextResponse.json(
      { error: "メールIDが提供されていません" },
      { status: 400 }
    );
  }

  try {
    // メール情報を取得
    const emailQuery = `
      SELECT e.id, e.title, e.email, e.cc, e.template_type,
             ts.plan, ts.confirmation,
             td.goal, td.known_info, td.question
      FROM emails e
      LEFT JOIN template_specification ts ON e.id = ts.email_id
      LEFT JOIN template_development td ON e.id = td.email_id
      WHERE e.id = $1
    `;
    const { rows } = await pool.query(emailQuery, [emailId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "メールが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("メール詳細取得エラー:", error);
    return NextResponse.json(
      { error: "メール詳細の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const emailId = (await context.params)?.id; // 非同期で params.id を取得

  if (!emailId) {
    return NextResponse.json(
      { error: "メールIDが提供されていません" },
      { status: 400 }
    );
  }

  const body = await req.json();

  try {
    const updateFields = [];
    const updateValues = [];
    let counter = 1;

    // template_type を文字列から id に変換
    const templateType = Object.values(TEMPLATE_TYPES).find(
      (type) => type.id === body.template_type
    );

    if (!templateType) {
      return NextResponse.json(
        { error: "無効な template_type です" },
        { status: 400 }
      );
    }

    // emails テーブルの基本情報を動的に更新
    for (const [key, value] of Object.entries(body)) {
      if (
        ["title", "email", "cc", "template_type"].includes(key) &&
        value !== undefined
      ) {
        updateFields.push(`${key} = $${counter}`);
        updateValues.push(value);
        counter++;
      }
    }

    if (updateFields.length > 0) {
      updateValues.push(emailId); // 最後の値はID
      const emailQuery = `
        UPDATE emails
        SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${counter}
      `;
      await pool.query(emailQuery, updateValues);
    }

    // template_specification テーブルの動的更新
    if (templateType.id === "1") {
      const specFields = [];
      const specValues = [];
      let specCounter = 1;

      if (body.plan !== undefined) {
        specFields.push(`plan = $${specCounter}`);
        specValues.push(body.plan);
        specCounter++;
      }
      if (body.confirmation !== undefined) {
        specFields.push(`confirmation = $${specCounter}`);
        specValues.push(body.confirmation);
        specCounter++;
      }

      if (specFields.length > 0) {
        specValues.push(emailId); // 最後の値は email_id
        const specQuery = `
          UPDATE template_specification
          SET ${specFields.join(", ")}
          WHERE email_id = $${specCounter}
        `;
        await pool.query(specQuery, specValues);
      }
    }

    // template_development テーブルの動的更新
    if (templateType.id === "2") {
      const devFields = [];
      const devValues = [];
      let devCounter = 1;

      if (body.goal !== undefined) {
        devFields.push(`goal = $${devCounter}`);
        devValues.push(body.goal);
        devCounter++;
      }
      if (body.known_info !== undefined) {
        devFields.push(`known_info = $${devCounter}`);
        devValues.push(body.known_info);
        devCounter++;
      }
      if (body.question !== undefined) {
        devFields.push(`question = $${devCounter}`);
        devValues.push(body.question);
        devCounter++;
      }

      if (devFields.length > 0) {
        devValues.push(emailId); // 最後の値は email_id
        const devQuery = `
          UPDATE template_development
          SET ${devFields.join(", ")}
          WHERE email_id = $${devCounter}
        `;
        await pool.query(devQuery, devValues);
      }
    }

    return NextResponse.json({ message: "更新が成功しました" });
  } catch (error) {
    console.error("更新エラー:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
