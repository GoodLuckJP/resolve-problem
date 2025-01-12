"use client";

import { useEffect, useState } from "react";
import "../../../../styles/task-detail.css";
import { useParams } from "next/navigation";
import { TaskDetail } from "@/type/task";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_name: string;
}

export default function TaskDetailPage() {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const params = useParams();
  const taskId = params.id;

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data);
      }
    };
    fetchTask();

    const fetchComments = async () => {
      const res = await fetch(`/api/comments?task_id=${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    };
    fetchComments();
  }, [taskId]);

  const toggleVisibility = async () => {
    if (!task) return;

    const updatedTask = {
      ...task,
      visibility: !task.visibility,
    };

    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });

    if (res.ok) {
      const data = await res.json();
      setTask(data);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment) return;

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task_id: taskId,
        user_id: 1, // 仮のユーザーID
        content: newComment,
      }),
    });

    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    }
  };

  if (!task) {
    return <div>Loading...</div>;
  }

  return (
    <div className="task-detail-container">
      <div className="task-header">
        <h1>{task.title}</h1>
        <button
          className={`visibility-button ${
            task.visibility ? "public" : "private"
          }`}
          onClick={toggleVisibility}
        >
          {task.visibility ? "公開" : "非公開"}
        </button>
      </div>
      <p>{task.description}</p>

      <div className="comments-section">
        <h2>コメント</h2>
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p>
                <strong>{comment.user_name}</strong> (
                {new Date(comment.created_at).toLocaleString()})
              </p>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力..."
        ></textarea>
        <button onClick={handleCommentSubmit}>コメントを追加</button>
      </div>
    </div>
  );
}
