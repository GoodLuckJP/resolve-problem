import React, { useState } from "react";
import "../../../styles/task-modal.css";

interface TaskModalProps {
  onClose: (isCreated: boolean) => void;
}

export default function TaskModal({ onClose }: TaskModalProps) {
  const [task, setTask] = useState({
    user_id: 1,
    title: "",
    description: "", // マークダウン用
    status: "todo",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  const handleSubmit = async () => {
    // タスク作成API呼び出し
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
      onClose(false); // モーダルを閉じる
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(true)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>タスク作成</h2>
        <div className="form-group">
          <label>タイトル</label>
          <input
            type="text"
            name="title"
            value={task.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>説明 (マークダウン対応)</label>
          <textarea
            name="description"
            value={task.description}
            onChange={handleInputChange}
            rows={8}
            placeholder="マークダウンで入力してください"
          ></textarea>
        </div>
        <div className="form-group">
          <label>状態</label>
          <select
            name="status"
            value={task.status}
            onChange={handleInputChange}
          >
            <option value="todo">To do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="form-actions">
          <button onClick={handleSubmit}>作成</button>
          <button onClick={() => onClose(false)}>キャンセル</button>
        </div>
      </div>
    </div>
  );
}
