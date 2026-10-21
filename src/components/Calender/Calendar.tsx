"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Spin, Button, Typography, Tooltip } from "antd";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import { useTasksStore, Task, StatusKey } from "../../state/tasks";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "./style.css";
import type { CalendarProps } from "antd";
import type { Dayjs } from "dayjs";
import TaskDetailModal from "./TaskDetailModal";
import DayTasksModal from "./DayTasksModal";
import TaskFormModal from "./TaskFormModal";
import { STATUS_STYLE, toStatus, todayISO } from "./taskMeta";

const { Title, Text } = Typography;

const fetchTasks = async (): Promise<Task[]> => {
  const { data } = await axios.get<Task[]>("/api");
  return data;
};

const CalendarComponent: React.FC = () => {
  const { tasks, setTasks } = useTasksStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [currentMonthTasks, setCurrentMonthTasks] = useState(0);
  const [viewTaskId, setViewTaskId] = useState<string | null>(null);
  const viewTask = tasks.find((t) => t.id === viewTaskId);
  const [dayViewDate, setDayViewDate] = useState<string | null>(null);
  const dayViewTasks = dayViewDate ? tasks.filter((t) => t.date === dayViewDate) : [];

  const openDay = (date: string) => {
    if (tasks.some((t) => t.date === date)) setDayViewDate(date);
    else openModal(date);
  };

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

  const handleSave = (data: Task) => {
    if (selectedTask) {
      setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? { ...data, id: t.id } : t)));
    } else {
      setTasks((prev) => [...prev, { ...data, id: String(Date.now()) }]);
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedTask(undefined);
  };

  const handleEditFromDetail = (task: Task) => {
    setViewTaskId(null);
    openModal(task.date, task);
  };

  const handleDelete = (task: Task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setViewTaskId(null);
  };

  const handleStatusChange = (task: Task, status: StatusKey) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
  };

  const fullCellRender: CalendarProps<Dayjs>["fullCellRender"] = (value, info) => {
    if (info.type !== "date") return info.originNode;

    const date = value.format("YYYY-MM-DD");
    const tasksForDate = tasks.filter((t) => t.date === date);
    const isToday = value.isSame(info.today, "day");
    const isWeekend = value.day() === 0 || value.day() === 6;
    // Two events + a "more" row fit the cell; with exactly three, show all three.
    const visible = tasksForDate.length <= 3 ? tasksForDate : tasksForDate.slice(0, 2);
    const hidden = tasksForDate.length - visible.length;

    return (
      <div
        className={[
          "day-cell",
          isToday && "is-today",
          isWeekend && "is-weekend",
          tasksForDate.length > 0 && "has-tasks",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => {
          e.stopPropagation();
          openDay(date);
        }}
      >
        <div className="day-head">
          <span className="day-num">{value.date()}</span>
          <Tooltip title="Add task" mouseEnterDelay={0.4}>
            <button
              type="button"
              className="day-add"
              aria-label={`Add task on ${value.format("MMM D")}`}
              onClick={(e) => {
                e.stopPropagation();
                openModal(date);
              }}
            >
              <PlusOutlined />
            </button>
          </Tooltip>
        </div>

        {tasksForDate.length > 0 && (
          <>
            <div className="day-events">
              {visible.map((item) => {
                const status = toStatus(item.status);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`day-event${status === 3 ? " is-done" : ""}`}
                    style={{ "--ev-color": STATUS_STYLE[status].color } as React.CSSProperties}
                    title={item.title}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDayViewDate(date);
                    }}
                  >
                    {item.title || "Untitled task"}
                  </button>
                );
              })}
              {hidden > 0 && (
                <button
                  type="button"
                  className="day-more"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDayViewDate(date);
                  }}
                >
                  +{hidden} more
                </button>
              )}
            </div>

            <div className="day-dots" aria-hidden>
              {tasksForDate.slice(0, 4).map((item) => (
                <span
                  key={item.id}
                  className="day-dot"
                  style={{ background: STATUS_STYLE[toStatus(item.status)].color }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="page-header">
        <Title level={4}>
          <CalendarOutlined /> Calendar
        </Title>
        <div className="page-header-actions">
          <div className="stats-card">
            <Text type="secondary">Tasks This Month</Text>
            <Text strong>{currentMonthTasks}</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(todayISO())}>
            Add Task
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text className="loading-text">Loading tasks...</Text>
        </div>
      ) : error ? (
        <div className="error-container">
          <Text type="danger">Failed to load tasks.</Text>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      ) : (
        <Calendar
          className="custom-calendar"
          fullscreen={false}
          onSelect={(date, { source }) => {
            if (source === "date") openDay(date.format("YYYY-MM-DD"));
          }}
          fullCellRender={fullCellRender}
        />
      )}

      <TaskFormModal
        open={isModalVisible}
        date={selectedDate}
        task={selectedTask}
        onClose={handleCancel}
        onSave={handleSave}
      />

      <DayTasksModal
        date={dayViewDate}
        hidden={!!viewTask}
        tasks={dayViewTasks}
        onClose={() => setDayViewDate(null)}
        onOpenTask={(task) => setViewTaskId(task.id)}
        onAddTask={(date) => openModal(date)}
      />

      <TaskDetailModal
        task={viewTask}
        onClose={() => {
          setViewTaskId(null);
          setDayViewDate(null);
        }}
        onBack={() => setViewTaskId(null)}
        onEdit={handleEditFromDetail}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default CalendarComponent;
