import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";
import pool from "@/lib/db";

import { EmailTemplateData } from "@/type/email";
import { encryptId } from "@/lib/crypto";
import {
  generateDevelopmentTemplate,
  generateSpecificationTemplate,
} from "@/lib/emailTempletes";

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

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "ユーザーが認証されていません" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    // メールデータを保存
    const result = await pool.query(
      "INSERT INTO emails (user_id, title, email, cc, template_type) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [userId, title, email, cc, template_type]
    );
    const insertedId = result.rows[0].id;
    const bcryptId = encryptId(insertedId);

    await pool.query(`UPDATE emails SET bcrypt_id = $1 WHERE id = $2`, [
      bcryptId,
      insertedId,
    ]);

    const { rows } = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [
      insertedId,
    ]);

    const emailId = rows[0].id;

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
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // EmailTemplateDataの作成
      const emailData: EmailTemplateData = {
        title,
        email,
        cc,
        template_type: String(template_type), // 数値を文字列に変換
        plan,
        confirmation,
        goal,
        known_info,
        question,
      };

      // テンプレートタイプに応じてHTMLを生成
      const emailContent =
        template_type === 1
          ? generateSpecificationTemplate(emailData)
          : generateDevelopmentTemplate(emailData);

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
