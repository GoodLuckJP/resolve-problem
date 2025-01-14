import React, { useState } from "react";
import "../../../styles/task-modal.css";
import RichTextEditor from "../editor/RichTextEditor";

interface TaskModalProps {
  onClose: (isCreated: boolean) => void;
}

export default function TaskModal({ onClose }: TaskModalProps) {
  const [task, setTask] = useState({
    user_id: 1,
    title: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  const handleEditorChange = (content: string) => {
    setTask((prevTask) => ({ ...prevTask, description: content }));
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (res.ok) {
      alert("タスクが作成されました！");
      onClose(true);
    } else {
      alert("タスク作成に失敗しました");
      onClose(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>タスク作成</h2>
          <button className="close-button" onClick={() => onClose(false)}>
            ×
          </button>
        </div>

        <div className="form-group">
          <label>
            タイトル
            <span className="required">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={task.title}
            onChange={handleInputChange}
            placeholder="タスクのタイトルを入力"
            required
            className="modern-input"
          />
        </div>

        <div className="form-group">
          <label>
            説明
            <span className="helper-text">
              リッチテキストエディターを使用できます
            </span>
          </label>
          <RichTextEditor
            content={task.description}
            onChange={handleEditorChange}
          />
        </div>

        <div className="form-actions">
          <button className="cancel-button" onClick={() => onClose(false)}>
            キャンセル
          </button>
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={!task.title}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
}
