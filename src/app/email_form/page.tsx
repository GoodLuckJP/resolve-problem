"use client";

import { useEffect, useState } from "react";
import "../../../styles/email-form.css";

interface Suggestion {
  id: number;
  title: string;
  match: string;
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
  const [selectedTask, setSelectedTask] = useState<Suggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim() === "") {
        setSuggestions([]);
        return;
      }

      const res = await fetch(`/api/search_tasks?query=${searchTerm}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.slice(0, 5)); // 最大5件を補完表示
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

  const handleSpecificationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTemplateSpecification((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDevelopmentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTemplateDevelopment((prev) => ({
      ...prev,
      [name]: value,
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
    } else {
      alert("処理に失敗しました...");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    const res = await fetch(`/api/search_tasks?query=${searchTerm}`);
    if (res.ok) {
      const data = await res.json();
      if (data.length > 0) {
        setSelectedTask(data[0]);
        setIsModalOpen(true);
      }
    }
  };

  return (
    <div className="email-form-container">
      <div className="email-form">
        <h2>メール作成</h2>
        <form>
          <label>
            タイトル:
            <input
              type="text"
              name="title"
              value={commonData.title}
              onChange={handleCommonChange}
              required
            />
          </label>
          <label>
            メールアドレス:
            <input
              type="email"
              name="email"
              value={commonData.email}
              onChange={handleCommonChange}
              required
            />
          </label>
          <label>
            CC（オプション）:
            <input
              type="email"
              name="cc"
              value={commonData.cc}
              onChange={handleCommonChange}
            />
          </label>
          <label>
            テンプレートの種類:
            <select
              name="template_type"
              value={commonData.template_type}
              onChange={handleCommonChange}
            >
              <option value={1}>仕様の段階の質問</option>
              <option value={2}>開発での質問</option>
            </select>
          </label>

          {commonData.template_type === 1 && (
            <>
              <label>
                プラン:
                <textarea
                  name="plan"
                  value={templateSpecification.plan}
                  onChange={handleSpecificationChange}
                ></textarea>
              </label>
              <label>
                確認内容:
                <textarea
                  name="confirmation"
                  value={templateSpecification.confirmation}
                  onChange={handleSpecificationChange}
                ></textarea>
              </label>
            </>
          )}

          {commonData.template_type === 2 && (
            <>
              <label>
                やりたいこと:
                <textarea
                  name="goal"
                  value={templateDevelopment.goal}
                  onChange={handleDevelopmentChange}
                ></textarea>
              </label>
              <label>
                わかっていること:
                <textarea
                  name="known_info"
                  value={templateDevelopment.known_info}
                  onChange={handleDevelopmentChange}
                ></textarea>
              </label>
              <label>
                質問内容:
                <textarea
                  name="question"
                  value={templateDevelopment.question}
                  onChange={handleDevelopmentChange}
                ></textarea>
              </label>
            </>
          )}

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
              className="send-email-button"
            >
              メールを送信
            </button>
          </div>
        </form>
      </div>

      {/* 右側: 証跡検索 */}
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
          <button onClick={handleSearch} className="search-button">
            検索
          </button>
        </div>
        <ul className="suggestions">
          {suggestions.map((task) => (
            <li key={task.id} onClick={() => setSelectedTask(task)}>
              <strong>{task.title}</strong>
              <p>{task.match}</p>
            </li>
          ))}
        </ul>
      </div>

      {isModalOpen && selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedTask.title}</h2>
            <p>{selectedTask.match}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="close-button"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
