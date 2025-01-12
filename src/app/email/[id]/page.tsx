"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import "../../../../styles/email-detail.css";

const TEMPLATE_TYPES = {
  SPECIFICATION: { id: "1", name: "仕様の段階の質問" },
  DEVELOPMENT: { id: "2", name: "開発での質問" },
};

interface EmailDetail {
  id: number;
  title: string;
  email: string;
  cc: string | null;
  template_type: string; // 数字の文字列
  plan?: string;
  confirmation?: string;
  goal?: string;
  known_info?: string;
  question?: string;
}

export default function EmailDetailPage() {
  const params = useParams();
  const emailId = params.id;
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);

  useEffect(() => {
    const fetchEmailDetail = async () => {
      const res = await fetch(`/api/emails/${emailId}`);
      if (res.ok) {
        const data = await res.json();
        setEmailDetail(data);
      } else {
        console.error("メール詳細の取得に失敗しました");
      }
    };

    fetchEmailDetail();
  }, [emailId]);

  const handleSendEmail = async () => {
    try {
      const res = await fetch("/api/send_email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailId }),
      });

      if (res.ok) {
        alert("メールが送信されました");
      } else {
        const error = await res.json();
        console.error("メール送信エラー:", error.error);
        alert("メール送信に失敗しました");
      }
    } catch (error) {
      console.error("メール送信エラー:", error);
      alert("通信エラーが発生しました");
    }
  };

  const handleFieldChange = async (field: string, value: string) => {
    if (!emailDetail) return;

    // ローカルステートを更新
    setEmailDetail((prev) => (prev ? { ...prev, [field]: value } : prev));

    // サーバーに更新を送信
    try {
      const res = await fetch(`/api/emails/${emailId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: value,
          template_type: emailDetail.template_type, // 常に template_type を送信
        }),
      });

      if (!res.ok) {
        console.error("変更の保存に失敗しました");
      }
    } catch (error) {
      console.error("通信エラー:", error);
    }
  };

  if (!emailDetail) {
    return <div>Loading...</div>;
  }

  const templateTypeName = Object.values(TEMPLATE_TYPES).find(
    (type) => type.id === emailDetail.template_type
  )?.name;

  return (
    <div className="email-detail-container">
      <div className="task-header">
        <input
          type="text"
          value={emailDetail.title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          className="editable-title"
        />
        <button
          type="button"
          onClick={handleSendEmail}
          className="send-email-button"
        >
          メールを送信
        </button>
      </div>

      <p>
        <strong>宛先:</strong>
        <input
          type="email"
          value={emailDetail.email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          className="editable-input"
        />
      </p>

      {emailDetail.cc && (
        <p>
          <strong>CC:</strong>
          <input
            type="email"
            value={emailDetail.cc}
            onChange={(e) => handleFieldChange("cc", e.target.value)}
            className="editable-input"
          />
        </p>
      )}

      <p>
        <strong>テンプレートの種類:</strong> {templateTypeName}
      </p>

      {emailDetail.template_type === TEMPLATE_TYPES.SPECIFICATION.id && (
        <>
          <h2>{TEMPLATE_TYPES.SPECIFICATION.name}</h2>
          <p>
            <strong>プラン:</strong>
            <textarea
              value={emailDetail.plan || ""}
              onChange={(e) => handleFieldChange("plan", e.target.value)}
              className="editable-textarea"
            />
          </p>
          <p>
            <strong>確認内容:</strong>
            <textarea
              value={emailDetail.confirmation || ""}
              onChange={(e) =>
                handleFieldChange("confirmation", e.target.value)
              }
              className="editable-textarea"
            />
          </p>
        </>
      )}

      {emailDetail.template_type === TEMPLATE_TYPES.DEVELOPMENT.id && (
        <>
          <h2>{TEMPLATE_TYPES.DEVELOPMENT.name}</h2>
          <p>
            <strong>やりたいこと:</strong>
            <textarea
              value={emailDetail.goal || ""}
              onChange={(e) => handleFieldChange("goal", e.target.value)}
              className="editable-textarea"
            />
          </p>
          <p>
            <strong>わかっていること:</strong>
            <textarea
              value={emailDetail.known_info || ""}
              onChange={(e) => handleFieldChange("known_info", e.target.value)}
              className="editable-textarea"
            />
          </p>
          <p>
            <strong>質問内容:</strong>
            <textarea
              value={emailDetail.question || ""}
              onChange={(e) => handleFieldChange("question", e.target.value)}
              className="editable-textarea"
            />
          </p>
        </>
      )}
    </div>
  );
}
