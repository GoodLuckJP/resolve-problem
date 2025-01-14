"use client";

import { useEffect, useState } from "react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import "../../../styles/email-form.css";
import SearchTaskModal from "@/components/modals/SearchTaskModal";
import Link from "next/link";

interface Suggestion {
  id: number;
  title: string;
  match: string;
  bcrypt_id: string;
}

export default function EmailFormPage() {
  const [commonData, setCommonData] = useState({
    title: "",
    email: "",
    cc: "",
    template_type: 1,
  });

  const [templateSpecification, setTemplateSpecification] = useState({
    plan: "",
    confirmation: "",
  });

  const [templateDevelopment, setTemplateDevelopment] = useState({
    goal: "",
    known_info: "",
    question: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim() === "") {
        setSuggestions([]);
        return;
      }

      const res = await fetch(`/api/search_tasks?query=${searchTerm}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.slice(0, 5));
      }
    };

    fetchSuggestions();
  }, [searchTerm]);

  const handleCommonChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCommonData((prev) => ({
      ...prev,
      [name]: name === "template_type" ? Number(value) : value,
    }));
  };

  const handleSpecificationChange = (field: string, content: string) => {
    setTemplateSpecification((prev) => ({
      ...prev,
      [field]: content,
    }));
  };

  const handleDevelopmentChange = (field: string, content: string) => {
    setTemplateDevelopment((prev) => ({
      ...prev,
      [field]: content,
    }));
  };

  const handleSaveOrSend = async (send_email: boolean) => {
    const templateData =
      commonData.template_type === 1
        ? templateSpecification
        : templateDevelopment;

    const formData = {
      ...commonData,
      ...templateData,
      send_email,
    };

    const res = await fetch("/api/save_email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert(
        send_email ? "メールが送信されました！" : "データが保存されました！"
      );
      window.location.href = "/dashboard";
    } else {
      alert("処理に失敗しました...");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
  };

  const formatMatchText = (match: string) => {
    if (!match) return "";
    return match.replace(/<[^>]*>/g, "").slice(0, 100) + "...";
  };

  return (
    <div className="email-form-container">
      <div className="email-main">
        <div className="email-header">
          <div className="header-content">
            <div className="title-wrapper">
              <input
                type="text"
                name="title"
                value={commonData.title}
                onChange={handleCommonChange}
                className="title-input"
                placeholder="タイトルを入力"
                required
              />
            </div>
            <div className="button-group">
              <button
                type="button"
                onClick={() => handleSaveOrSend(false)}
                className="save-button"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => handleSaveOrSend(true)}
                className="send-button"
              >
                メールを送信
              </button>
            </div>
          </div>

          <div className="email-meta">
            <div className="field-group">
              <label>宛先:</label>
              <input
                type="email"
                name="email"
                value={commonData.email}
                onChange={handleCommonChange}
                className="text-input"
                required
              />
            </div>

            <div className="field-group">
              <label>CC（オプション）:</label>
              <input
                type="email"
                name="cc"
                value={commonData.cc}
                onChange={handleCommonChange}
                className="text-input"
              />
            </div>

            <div className="field-group">
              <label>テンプレートの種類:</label>
              <select
                name="template_type"
                value={commonData.template_type}
                onChange={handleCommonChange}
                className="template-select"
              >
                <option value={1}>仕様の段階の質問</option>
                <option value={2}>開発での質問</option>
              </select>
            </div>
          </div>
        </div>

        <div className="email-content">
          {commonData.template_type === 1 && (
            <div className="email-section">
              <h2>仕様の段階の質問</h2>
              <div className="field-group">
                <label>プラン:</label>
                <RichTextEditor
                  content={templateSpecification.plan}
                  onChange={(content) =>
                    handleSpecificationChange("plan", content)
                  }
                />
              </div>
              <div className="field-group">
                <label>確認内容:</label>
                <RichTextEditor
                  content={templateSpecification.confirmation}
                  onChange={(content) =>
                    handleSpecificationChange("confirmation", content)
                  }
                />
              </div>
            </div>
          )}

          {commonData.template_type === 2 && (
            <div className="email-section">
              <h2>開発での質問</h2>
              <div className="field-group">
                <label>やりたいこと:</label>
                <RichTextEditor
                  content={templateDevelopment.goal}
                  onChange={(content) =>
                    handleDevelopmentChange("goal", content)
                  }
                />
              </div>
              <div className="field-group">
                <label>わかっていること:</label>
                <RichTextEditor
                  content={templateDevelopment.known_info}
                  onChange={(content) =>
                    handleDevelopmentChange("known_info", content)
                  }
                />
              </div>
              <div className="field-group">
                <label>質問内容:</label>
                <RichTextEditor
                  content={templateDevelopment.question}
                  onChange={(content) =>
                    handleDevelopmentChange("question", content)
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="email-search">
        <h2>証跡検索</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="証跡を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            onClick={handleSearch}
            className="search-button"
            disabled={!searchTerm.trim() || suggestions.length === 0}
          >
            検索
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((task) => (
              <li key={task.id}>
                <Link href={`/task/${encodeURIComponent(task.bcrypt_id)}`}>
                  <strong>{task.title}</strong>
                  <p>{formatMatchText(task.match)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
