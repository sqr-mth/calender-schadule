"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Button, Typography, Tooltip } from "antd";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import { useTasksStore, Task, StatusKey } from "../../state/tasks";
import "./style.css";
import type { CalendarProps } from "antd";
import type { Dayjs } from "dayjs";
import TaskDetailModal from "./TaskDetailModal";
import DayTasksModal from "./DayTasksModal";
import TaskFormModal from "./TaskFormModal";
import { STATUS_STYLE, toStatus, todayISO } from "./taskMeta";

const { Title, Text } = Typography;



const CalendarComponent: React.FC = () => {
  const { tasks: allTasks, addTask, updateTask } = useTasksStore();
  const tasks = allTasks.filter(t => !t.deletedAt && !t.archived);
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
      updateTask(selectedTask.id, data);
    } else {
      addTask(data);
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
    updateTask(task.id, { deletedAt: new Date().toISOString() });
    setViewTaskId(null);
  };

  const handleStatusChange = (task: Task, status: StatusKey) => {
    updateTask(task.id, { status });
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

      <Calendar
        className="custom-calendar"
        fullscreen={false}
        onSelect={(date, { source }) => {
          if (source === "date") openDay(date.format("YYYY-MM-DD"));
        }}
        fullCellRender={fullCellRender}
      />

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
