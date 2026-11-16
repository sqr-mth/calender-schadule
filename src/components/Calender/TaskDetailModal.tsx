"use client";

import React from "react";
import { Modal, Button, Popconfirm } from "antd";
import {
  AlignLeftOutlined,
  CalendarOutlined,
  FlagOutlined,
  LeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Status, StatusKey, Task } from "@/state/tasks";
import { STATUS_KEYS, STATUS_STYLE, formatDate, relativeDay, shortDate, toStatus } from "./taskMeta";
import "./modals.css";

type Props = {
  task: Task | undefined;
  onClose: () => void;
  /** Shows a "back to day list" link when the modal was opened from that list. */
  onBack?: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: StatusKey) => void;
};

const TaskDetailModal: React.FC<Props> = ({ task, onClose, onBack, onEdit, onDelete, onStatusChange }) => {
  const status = toStatus(task?.status);
  const { color, icon } = STATUS_STYLE[status];

  return (
    <Modal
      open={!!task}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      rootClassName="task-detail-modal"
      styles={{ content: { padding: 0, overflow: "hidden" } }}
    >
      {task && (
        <>
          <header className="td-head">
            <span className="td-icon-tile" style={{ color, background: `${color}17` }}>
              {icon}
            </span>
            <div className="td-head-text">
              {onBack ? (
                <button type="button" className="td-back" onClick={onBack}>
                  <LeftOutlined /> All tasks · {shortDate(task.date)}
                </button>
              ) : (
                <span className="td-eyebrow">Task</span>
              )}
              <h2 className="td-title">{task.title || "Untitled task"}</h2>
            </div>
          </header>

          <dl className="td-props">
            <dt>
              <FlagOutlined /> Status
            </dt>
            <dd>
              <div className="td-status-group" role="radiogroup" aria-label="Status">
                {STATUS_KEYS.map((key) => {
                  const opt = STATUS_STYLE[key];
                  const active = key === status;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`td-status-opt${active ? " is-active" : ""}`}
                      style={
                        active
                          ? { color: opt.color, borderColor: opt.color, background: `${opt.color}12` }
                          : undefined
                      }
                      onClick={() => !active && onStatusChange(task, key)}
                    >
                      <span className="td-status-opt-icon" style={{ color: opt.color }}>
                        {opt.icon}
                      </span>
                      {Status[key]}
                    </button>
                  );
                })}
              </div>
            </dd>

            <dt>
              <CalendarOutlined /> Date
            </dt>
            <dd className="td-date-value">
              {formatDate(task.date)}
              <span className="td-date-rel">{relativeDay(task.date)}</span>
            </dd>
          </dl>

          <section className="td-desc-section">
            <h3 className="td-desc-heading">
              <AlignLeftOutlined /> Description
            </h3>
            {typeof task.desc === 'string' && task.desc.trim() ? (
              <p className="td-desc-box">{task.desc}</p>
            ) : (
              <button type="button" className="td-desc-box td-desc-add" onClick={() => onEdit(task)}>
                <PlusOutlined /> Add a description
              </button>
            )}
          </section>

          <footer className="td-footer">
            <Popconfirm
              title="Delete this task?"
              description="This can't be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(task)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} className="td-delete-btn">
                Delete
              </Button>
            </Popconfirm>
            <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(task)}>
              Edit task
            </Button>
          </footer>
        </>
      )}
    </Modal>
  );
};

export default TaskDetailModal;
