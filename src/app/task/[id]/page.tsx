"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TaskDetail } from "@/type/task";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { FaLock, FaLockOpen } from "react-icons/fa";
import "../../../../styles/task-detail.css";

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
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveStatus, setShowSaveStatus] = useState(false);
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

    const fetchComments = async () => {
      const res = await fetch(`/api/comments?task_id=${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    };

    fetchTask();
    fetchComments();
  }, [taskId]);

  const handleFieldChange = async (field: string, value: string | boolean) => {
    if (!task) return;

    setTask((prev) => (prev ? { ...prev, [field]: value } : prev));
    setIsSaving(true);
    setShowSaveStatus(false);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
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

  const handleCommentSubmit = async () => {
    if (!newComment || !taskId) return;

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_id: taskId,
        user_id: 1,
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
    return (
      <div className="task-loading">
        <div className="loading-spinner"></div>
        <p>Loading task...</p>
      </div>
    );
  }

  return (
    <div className="task-detail-container">
      <div className="task-main">
        <div className="task-header">
          <div className="task-title-section">
            <div className="title-wrapper">
              <textarea
                value={task.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="task-title-input"
                placeholder="タスクのタイトルを入力"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = target.scrollHeight + "px";
                }}
              />
              <div className={`save-status ${showSaveStatus ? "show" : ""}`}>
                {isSaving ? "保存中..." : "すべての変更を保存しました"}
              </div>
            </div>
            <div className="task-meta">
              <button
                className={`visibility-toggle ${
                  task.visibility ? "public" : "private"
                }`}
                onClick={() =>
                  handleFieldChange("visibility", !task.visibility)
                }
                title={task.visibility ? "公開" : "非公開"}
              >
                {task.visibility ? <FaLockOpen /> : <FaLock />}
              </button>
            </div>
          </div>
        </div>

        <div className="task-description">
          <h3 className="section-title">説明</h3>
          <RichTextEditor
            content={task.description}
            onChange={(content) => handleFieldChange("description", content)}
          />
        </div>

        <div className="task-comments">
          <h3 className="section-title">コメント</h3>
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{comment.user_name}</span>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <div
                  className="comment-content"
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />
              </div>
            ))}
          </div>

          <div className="new-comment">
            <RichTextEditor content={newComment} onChange={setNewComment} />
            <button
              className="submit-comment"
              onClick={handleCommentSubmit}
              disabled={!newComment}
            >
              コメントを投稿
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
