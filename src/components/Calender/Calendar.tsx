"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Modal, Badge, List, Spin, Button, Typography, Empty } from "antd";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import { useTasksStore, Task, StatusKey } from "../../state/tasks";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "./style.css";
import CalenderForm from "./FormCalender";

const { Title, Text } = Typography;

const fetchTasks = async (): Promise<Task[]> => {
  const { data } = await axios.get<Task[]>("/api");
  return data;
};

const CalendarComponent: React.FC = () => {
  const { tasks, setTasks } = useTasksStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState<Task | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [currentMonthTasks, setCurrentMonthTasks] = useState(0);

  const { data: posts, error, isLoading } = useQuery({
    queryKey: ["postsData"],
    queryFn: fetchTasks,
  });

  // Seed store with API tasks (deduped by id)
  useEffect(() => {
    if (!posts?.length) return;
    setTasks((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const incoming = posts.filter((t) => !existingIds.has(t.id));
      return incoming.length ? [...prev, ...incoming] : prev;
    });
  }, [posts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-init form data when modal opens
  useEffect(() => {
    if (!isModalVisible) return;
    if (selectedTask) {
      setFormData({ ...selectedTask, date: selectedDate ?? selectedTask.date });
    } else {
      setFormData({
        id: String(Date.now()),
        title: "",
        desc: "",
        date: selectedDate ?? new Date().toISOString().split("T")[0],
        status: 1 as StatusKey,
      });
    }
  }, [isModalVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Count tasks in the current calendar month
  useEffect(() => {
    const today = new Date();
    const prefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonthTasks(tasks.filter((t) => t.date.startsWith(prefix)).length);
  }, [tasks]);

  const openModal = (date: string, task?: Task) => {
    setSelectedDate(date);
    setSelectedTask(task);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (!formData) return;
    if (selectedTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? { ...formData, id: t.id } : t)),
      );
    } else {
      setTasks((prev) => [...prev, { ...formData, id: String(Date.now()) }]);
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedTask(undefined);
  };

  const dateCellRender = (value: { format: (f: string) => string; day: () => number }) => {
    const date = value.format("YYYY-MM-DD");
    const tasksForDate = tasks.filter((t) => t.date === date);
    const today = new Date().toISOString().split("T")[0];
    const isToday = date === today;
    const isWeekend = value.day() === 0 || value.day() === 6;

    const hasOverdue = tasksForDate.some((t) => Number(t.status) === 2);
    const hasUrgent = tasksForDate.some((t) => Number(t.status) === 1);
    const allCompleted =
      tasksForDate.length > 0 && tasksForDate.every((t) => Number(t.status) === 3);

    const badgeColor = hasOverdue ? "#ff4d4f" : allCompleted ? "#52c41a" : hasUrgent ? "#faad14" : "#1890ff";

    return (
      <div
        className={[
          "calendar-cell",
          isToday && "today-cell",
          hasOverdue && "has-overdue",
          hasUrgent && "has-urgent",
          allCompleted && "all-completed",
          isWeekend && "weekend-cell",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => {
          e.stopPropagation();
          openModal(date);
        }}
      >
        {tasksForDate.length > 0 ? (
          <div className="task-container">
            <div className="task-count">
              <Badge
                count={tasksForDate.length}
                style={{ backgroundColor: badgeColor, boxShadow: "0 0 0 2px rgba(255,255,255,0.8)" }}
              />
            </div>
            <List
              size="small"
              className="task-list"
              dataSource={tasksForDate.slice(0, 3)}
              renderItem={(item) => (
                <List.Item
                  id={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(item.date, item);
                  }}
                  className={`task-item status-${Number(item.status)}`}
                >
                  <Badge
                    status={
                      Number(item.status) === 3 ? "success"
                        : Number(item.status) === 2 ? "error"
                          : "warning"
                    }
                    text={<span className="task-title">{item.title}</span>}
                    className="task-badge"
                  />
                </List.Item>
              )}
            />
            {tasksForDate.length > 3 && (
              <div className="more-tasks">+{tasksForDate.length - 3} more</div>
            )}
          </div>
        ) : (
          <div className="empty-cell">
            <PlusOutlined className="add-task-icon" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <Title level={4}>
          <CalendarOutlined /> Interactive Calendar
        </Title>
        <div className="calendar-summary">
          <div className="stats-card">
            <Text type="secondary">Tasks This Month</Text>
            <Text strong>{currentMonthTasks}</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal(new Date().toISOString().split("T")[0])}
          >
            Add Task
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text className="loading-text">Loading your calendar…</Text>
        </div>
      ) : error ? (
        <div className="error-container">
          <Text type="danger">Failed to load calendar data.</Text>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : (
        <Calendar
          className="custom-calendar"
          fullscreen={false}
          onSelect={(date) => openModal(date.format("YYYY-MM-DD"))}
          cellRender={dateCellRender}
        />
      )}

      <Modal
        title={selectedTask ? "Edit Task" : "Add Task"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        className="task-modal"
        destroyOnClose
        okText={selectedTask ? "Save Changes" : "Add Task"}
      >
        {selectedDate ? (
          <CalenderForm
            onFormChange={(_changed, all) =>
              setFormData({ ...formData!, ...all, date: selectedDate })
            }
            initialValues={
              selectedTask ?? {
                id: String(Date.now()),
                title: "",
                desc: "",
                date: selectedDate,
                status: 1 as StatusKey,
              }
            }
          />
        ) : (
          <Empty description="No date selected" />
        )}
      </Modal>
    </div>
  );
};

export default CalendarComponent;
