import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// PostgreSQL接続プール
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { emailId } = body;

  const session = await getServerSession(authOptions); // セッション情報を取得

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: "ユーザーが認証されていません" },
      { status: 401 }
    );
  }

  try {
    // メールデータをデータベースから取得
    const emailQuery = `
      SELECT e.title, e.email, e.cc, e.template_type, 
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
        { error: "指定されたメールIDのデータが見つかりません" },
        { status: 404 }
      );
    }

    const emailData = rows[0];

    // Nodemailerでメール送信の準備
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
    let emailContent = `<h1>${emailData.title}</h1>`;
    if (emailData.template_type === "1") {
      emailContent += `
        <p><strong>プラン:</strong> ${emailData.plan}</p>
        <p><strong>確認内容:</strong> ${emailData.confirmation}</p>
      `;
    } else if (emailData.template_type === "2") {
      emailContent += `
        <p><strong>やりたいこと:</strong> ${emailData.goal}</p>
        <p><strong>わかっていること:</strong> ${emailData.known_info}</p>
        <p><strong>質問内容:</strong> ${emailData.question}</p>
      `;
    }

    // メール送信
    await transporter.sendMail({
      from: `"システム管理者" <${process.env.SMTP_USER}>`,
      to: emailData.email,
      cc: emailData.cc || undefined,
      subject: emailData.title,
      html: emailContent,
    });

    return NextResponse.json({ message: "メールが送信されました" });
  } catch (error) {
    console.error("メール送信エラー:", error);
    return NextResponse.json(
      { error: "メール送信に失敗しました" },
      { status: 500 }
    );
  }
}
