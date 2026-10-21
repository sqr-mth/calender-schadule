"use client";

import React from "react";
import { Modal, Button, Empty } from "antd";
import { PlusOutlined, RightOutlined } from "@ant-design/icons";
import { Status, Task } from "@/state/tasks";
import { STATUS_STYLE, formatDate, relativeDay, toStatus } from "./taskMeta";
import "./modals.css";

type Props = {
  date: string | null;
  hidden: boolean;
  tasks: Task[];
  onClose: () => void;
  onOpenTask: (task: Task) => void;
  onAddTask: (date: string) => void;
};

const DayTasksModal: React.FC<Props> = ({ date, hidden, tasks, onClose, onOpenTask, onAddTask }) => {
  const done = tasks.filter((t) => toStatus(t.status) === 3).length;

  return (
    <Modal
      open={!!date && !hidden}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      rootClassName="day-tasks-modal"
      styles={{ content: { padding: 0, overflow: "hidden" } }}
    >
      {date && (
        <>
          <div className="dt-header">
            <div className="dt-date">
              {formatDate(date)}
              <span className="td-date-rel">{relativeDay(date)}</span>
            </div>
            <div className="dt-summary">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} · {done} done
            </div>
          </div>

          <div className="dt-list">
            {tasks.length === 0 ? (
              <Empty description="No tasks on this day" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              tasks.map((task) => {
                const status = toStatus(task.status);
                const { color, icon } = STATUS_STYLE[status];
                return (
                  <button
                    key={task.id}
                    type="button"
                    className="dt-item"
                    style={{ borderLeftColor: color }}
                    onClick={() => onOpenTask(task)}
                  >
                    <div className="dt-item-main">
                      <div className="dt-item-top">
                        <span className="dt-item-title">{task.title || "Untitled task"}</span>
                        <span className="td-status-pill" style={{ color, background: `${color}1a` }}>
                          {icon}
                          {Status[status]}
                        </span>
                      </div>
                      {task.desc ? (
                        <p className="dt-item-desc">{task.desc}</p>
                      ) : (
                        <p className="dt-item-desc td-desc-empty">No description</p>
                      )}
                    </div>
                    <RightOutlined className="dt-item-arrow" />
                  </button>
                );
              })
            )}
          </div>

          <div className="td-footer">
            <Button onClick={onClose}>Close</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => onAddTask(date)}>
              Add task
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default DayTasksModal;
