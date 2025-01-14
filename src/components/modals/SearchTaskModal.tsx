import React from "react";
import Link from "next/link";
import RichTextEditor from "../editor/RichTextEditor";

interface SearchTaskModalProps {
  task: {
    id: number;
    title: string;
    match: string;
  };
  onClose: () => void;
}

export default function SearchTaskModal({
  task,
  onClose,
}: SearchTaskModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task.title}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="form-group">
          <label>説明</label>
          <div className="rich-editor">
            <div
              className="editor-content"
              dangerouslySetInnerHTML={{ __html: task.match }}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="cancel-button" onClick={onClose}>
            閉じる
          </button>
          <Link href={`/task/${task.id}`}>
            <button className="submit-button">証跡を開く</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
