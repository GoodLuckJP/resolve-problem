"use client";

import { useEffect, useState } from "react";
import "../../../styles/task.css";
import { Task } from "@/type/task";

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    visibility: true,
  });

  // タスク一覧を取得
  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  // タスク作成
  const createTask = async () => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    if (res.ok) {
      const createdTask = await res.json();
      setTasks([createdTask, ...tasks]);
      setNewTask({ title: "", description: "", visibility: true });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>タスク管理ページ</h1>

      {/* タスク作成フォーム */}
      <div>
        <input
          type="text"
          placeholder="タイトル"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="説明"
          value={newTask.description}
          onChange={(e) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
          style={{ marginRight: "10px" }}
        />
        <button onClick={createTask}>タスク作成</button>
      </div>

      {/* タスク一覧 */}
      <ul style={{ marginTop: "20px" }}>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: "10px" }}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>公開: {task.visibility ? "公開" : "非公開"}</p>
            <p>完了: {task.is_completed ? "完了" : "未完了"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
