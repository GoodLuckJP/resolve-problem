import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";
import pool from "@/lib/db";

import { EmailTemplateData } from "@/type/email";

import { decryptId } from "@/lib/crypto";
import {
  generateDevelopmentTemplate,
  generateSpecificationTemplate,
} from "@/lib/emailTempletes";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { emailId } = body;
  const decodedEmailId = decodeURIComponent(emailId);
  const id = decryptId(decodedEmailId);

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "ユーザーが認証されていません" },
      { status: 401 }
    );
  }

  try {
    const emailQuery = `
      SELECT e.title, e.email, e.cc, e.template_type, 
             ts.plan, ts.confirmation, 
             td.goal, td.known_info, td.question
      FROM emails e
      LEFT JOIN template_specification ts ON e.id = ts.email_id
      LEFT JOIN template_development td ON e.id = td.email_id
      WHERE e.id = $1
    `;
    const { rows } = await pool.query(emailQuery, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "指定されたメールIDのデータが見つかりません" },
        { status: 404 }
      );
    }

    const emailData: EmailTemplateData = rows[0];

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // テンプレートタイプに応じてHTMLを生成
    const emailContent =
      emailData.template_type === "1"
        ? generateSpecificationTemplate(emailData)
        : generateDevelopmentTemplate(emailData);

    await transporter.sendMail({
      from: `"システム管理者" <${process.env.SMTP_USER}>`,
      to: `${emailData.email}, ${session.user.email}`,
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
