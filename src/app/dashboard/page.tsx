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
      fetchTasks(); // 作成後にリストを再取得
    }
  };

  const fetchTasks = async () => {
    const res = await fetch(`/api/tasks`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
  };

  // メール一覧を取得
  const fetchEmails = async () => {
    const res = await fetch(`/api/emails`);
    if (res.ok) {
      const data = await res.json();
      setEmails(data);
    }
  };

  // 初回取得
  useEffect(() => {
    if (user?.id) {
      fetchTasks();
      fetchEmails();
    }
  }, [user]);

  return (
    <div className="dashboard-container">
      {/* 左側: 証跡セクション */}
      <div className="section-group">
        <div className="dashboard-create-section">
          <button className="circle-button" onClick={openModal}>
            ＋
          </button>
          <h3>証跡内容作成</h3>
        </div>
        {isModalOpen && <TaskModal onClose={closeModal} />}

        <div className="dashboard-section">
          <h3>証跡一覧</h3>
          <ul className="item-list">
            {tasks.map((task) => (
              <li key={task.id}>
                <Link href={`/task/${task.id}`}>{task.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 右側: メールセクション */}
      <div className="section-group">
        <div className="dashboard-create-section">
          <Link href={`/email_form`}>
            <button className="circle-button">＋</button>
          </Link>
          <h3>メール作成</h3>
        </div>
        <div className="dashboard-section">
          <h3>メール一覧</h3>
          <ul className="item-list">
            {emails.map((email) => (
              <li key={email.id}>
                <Link href={`/email/${email.id}`}>{email.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
