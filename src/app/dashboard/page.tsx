"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import "../../../styles/dashboard.css";
import { useEffect, useState } from "react";
import TaskModal from "@/components/modals/TaskModal";
import Link from "next/link";
import { Task } from "@/type/task";
import { Email } from "@/type/email";

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = (isCreated: boolean = false) => {
    setIsModalOpen(false);
    if (isCreated) {
      fetchTasks();
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("証跡の取得に失敗しました:", error);
    }
  };

  const fetchEmails = async () => {
    try {
      const res = await fetch(`/api/emails`);
      if (res.ok) {
        const data = await res.json();
        setEmails(data);
      }
    } catch (error) {
      console.error("メールの取得に失敗しました:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
      fetchEmails();
    }
  }, [user]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="dashboard-container">
        {/* 証跡セクション */}
        <div className="section-group">
          <div className="dashboard-create-section">
            <button
              className="circle-button"
              onClick={openModal}
              aria-label="証跡を作成"
            >
              <span>＋</span>
            </button>
            <h3>証跡内容作成</h3>
          </div>
          {isModalOpen && <TaskModal onClose={closeModal} />}

          <div className="dashboard-section">
            <h3>証跡一覧</h3>
            {tasks.length > 0 ? (
              <ul className="item-list">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <Link href={`/task/${task.id}`}>{task.title}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center mt-4">
                証跡がまだありません
              </p>
            )}
          </div>
        </div>

        {/* メールセクション */}
        <div className="section-group">
          <div className="dashboard-create-section">
            <Link
              href="/email_form"
              className="inline-block"
              aria-label="メールを作成"
            >
              <button className="circle-button">
                <span>＋</span>
              </button>
            </Link>
            <h3>メール作成</h3>
          </div>

          <div className="dashboard-section">
            <h3>メール一覧</h3>
            {emails.length > 0 ? (
              <ul className="item-list">
                {emails.map((email) => (
                  <li key={email.id}>
                    <Link href={`/email/${email.id}`}>{email.title}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center mt-4">
                メールがまだありません
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
