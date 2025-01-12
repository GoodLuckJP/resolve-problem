import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title,
    email,
    cc,
    template_type,
    plan,
    confirmation,
    goal,
    known_info,
    question,
    send_email,
  } = body;

  const session = await getServerSession(authOptions); // セッション情報を取得

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: "ユーザーが認証されていません" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    // メールデータを保存
    const emailResult = await pool.query(
      "INSERT INTO emails (user_id, title, email, cc, template_type) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [userId, title, email, cc, template_type]
    );
    const emailId = emailResult.rows[0].id;

    // テンプレートごとのデータを保存
    if (template_type === 1) {
      await pool.query(
        "INSERT INTO template_specification (email_id, plan, confirmation) VALUES ($1, $2, $3)",
        [emailId, plan, confirmation]
      );
    } else if (template_type === 2) {
      await pool.query(
        "INSERT INTO template_development (email_id, goal, known_info, question) VALUES ($1, $2, $3, $4)",
        [emailId, goal, known_info, question]
      );
    }

    // メールを送信するフラグが立っている場合
    if (send_email) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false, // TLSを使用する場合はtrue
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // メール本文の作成
      let emailContent = `<h1>${title}</h1>`;
      if (template_type === 1) {
        emailContent += `
          <p><strong>プラン:</strong> ${plan}</p>
          <p><strong>確認内容:</strong> ${confirmation}</p>
        `;
      } else if (template_type === 2) {
        emailContent += `
          <p><strong>やりたいこと:</strong> ${goal}</p>
          <p><strong>わかっていること:</strong> ${known_info}</p>
          <p><strong>質問内容:</strong> ${question}</p>
        `;
      }

      // メール送信
      await transporter.sendMail({
        from: `"システム管理者" <${process.env.SMTP_USER}>`,
        to: email,
        cc: cc || undefined,
        subject: title,
        html: emailContent,
      });
    }

    return NextResponse.json({ message: "データが保存されました" });
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json({ error: "処理に失敗しました" }, { status: 500 });
  }
}
