"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import RichTextEditor from "@/components/editor/RichTextEditor";
import "../../../../styles/email-detail.css";
import { EmailDetail } from "@/type/email";

const TEMPLATE_TYPES = {
  SPECIFICATION: { id: "1", name: "仕様の段階の質問" },
  DEVELOPMENT: { id: "2", name: "開発での質問" },
};

export default function EmailDetailPage() {
  const params = useParams();
  const emailId = params.id;
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveStatus, setShowSaveStatus] = useState(false);

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

    setEmailDetail((prev) => (prev ? { ...prev, [field]: value } : prev));
    setIsSaving(true);
    setShowSaveStatus(false);

    try {
      const res = await fetch(`/api/emails/${emailId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: value,
          template_type: emailDetail.template_type,
        }),
      });

      if (!res.ok) {
        console.error("変更の保存に失敗しました");
      } else {
        setShowSaveStatus(true);
        setTimeout(() => {
          setShowSaveStatus(false);
        }, 2000);
      }
    } catch (error) {
      console.error("通信エラー:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!emailDetail) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const templateTypeName = Object.values(TEMPLATE_TYPES).find(
    (type) => type.id === emailDetail.template_type
  )?.name;

  return (
    <div className="email-detail-container">
      <div className="header-content">
        <div className="title-wrapper">
          <input
            type="text"
            value={emailDetail.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            className="title-input"
            placeholder="タイトルを入力"
          />
          <div className={`save-status ${showSaveStatus ? "show" : ""}`}>
            {isSaving ? "保存中..." : "すべての変更を保存しました"}
          </div>
        </div>
        <button type="button" onClick={handleSendEmail} className="send-button">
          メールを送信
        </button>
      </div>

      <div className="email-content">
        <div className="email-section">
          <div className="section-header">
            <h2>基本情報</h2>
          </div>
          <div className="section-content">
            <div className="field-group">
              <label>宛先</label>
              <input
                type="email"
                value={emailDetail.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                className="text-input"
                placeholder="メールアドレスを入力"
              />
            </div>
            <div className="field-group">
              <label>CC</label>
              <input
                type="email"
                value={emailDetail.cc || ""}
                onChange={(e) => handleFieldChange("cc", e.target.value)}
                className="text-input"
                placeholder="CCのメールアドレスを入力"
              />
            </div>
            <div className="field-group">
              <label>テンプレートの種類</label>
              <div className="template-type">{templateTypeName}</div>
            </div>
          </div>
        </div>

        {emailDetail.template_type === TEMPLATE_TYPES.SPECIFICATION.id && (
          <div className="email-section">
            <div className="section-header">
              <h2>仕様確認内容</h2>
            </div>
            <div className="section-content">
              <div className="field-group">
                <label>プラン</label>
                <RichTextEditor
                  content={emailDetail.plan || ""}
                  onChange={(value) => handleFieldChange("plan", value)}
                />
              </div>
              <div className="field-group">
                <label>確認内容</label>
                <RichTextEditor
                  content={emailDetail.confirmation || ""}
                  onChange={(value) => handleFieldChange("confirmation", value)}
                />
              </div>
            </div>
          </div>
        )}

        {emailDetail.template_type === TEMPLATE_TYPES.DEVELOPMENT.id && (
          <div className="email-section">
            <div className="section-header">
              <h2>開発質問内容</h2>
            </div>
            <div className="section-content">
              <div className="field-group">
                <label>やりたいこと</label>
                <RichTextEditor
                  content={emailDetail.goal || ""}
                  onChange={(value) => handleFieldChange("goal", value)}
                />
              </div>
              <div className="field-group">
                <label>わかっていること</label>
                <RichTextEditor
                  content={emailDetail.known_info || ""}
                  onChange={(value) => handleFieldChange("known_info", value)}
                />
              </div>
              <div className="field-group">
                <label>質問内容</label>
                <RichTextEditor
                  content={emailDetail.question || ""}
                  onChange={(value) => handleFieldChange("question", value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
