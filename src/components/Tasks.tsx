"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Typography } from "antd";
import {
  InboxOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useTasksStore, Task, Status, StatusKey } from "@/state/tasks";
import TaskDetailModal from "@/components/Calender/TaskDetailModal";
import TaskFormModal from "@/components/Calender/TaskFormModal";
import {
  STATUS_KEYS,
  STATUS_STYLE,
  mediumDate,
  relativeDay,
  toStatus,
  todayISO,
} from "@/components/Calender/taskMeta";

const { Title, Text } = Typography;

const fetchTasks = async (): Promise<Task[]> => {
  const { data } = await axios.get<Task[]>("/api");
  return data;
};

type Filter = "all" | StatusKey;

const NEAR_DAYS = new Set(["Today", "Tomorrow", "Yesterday"]);

const Tasks: React.FC = () => {
  const { tasks, setTasks } = useTasksStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [viewTaskId, setViewTaskId] = useState<string | null>(null);
  const [form, setForm] = useState<{ open: boolean; task?: Task }>({ open: false });
  const viewTask = tasks.find((t) => t.id === viewTaskId);

  const { data: posts } = useQuery({ queryKey: ["postsData"], queryFn: fetchTasks });

  // Seed store with API tasks (same as Calendar)
  useEffect(() => {
    if (!posts?.length) return;
    setTasks((prev) => {
      const ids = new Set(prev.map((t) => t.id));
      const incoming = posts.filter((t) => !ids.has(t.id));
      return incoming.length ? [...prev, ...incoming] : prev;
    });
  }, [posts]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: tasks.length, 1: 0, 2: 0, 3: 0 };
    tasks.forEach((t) => c[toStatus(t.status)]++);
    return c;
  }, [tasks]);

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = tasks.filter(
      (t) =>
        (filter === "all" || toStatus(t.status) === filter) &&
        (!q || t.title?.toLowerCase().includes(q) || t.desc?.toLowerCase().includes(q)),
    );
    const byDate = new Map<string, Task[]>();
    [...filtered]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((t) => byDate.set(t.date, [...(byDate.get(t.date) ?? []), t]));
    return [...byDate.entries()];
  }, [tasks, search, filter]);

  const handleSave = (data: Task) => {
    if (form.task) {
      setTasks((prev) => prev.map((t) => (t.id === form.task!.id ? { ...data, id: t.id } : t)));
    } else {
      setTasks((prev) => [...prev, { ...data, id: String(Date.now()) }]);
    }
    setForm({ open: false });
  };

  const filterOptions: { key: Filter; label: string; color?: string }[] = [
    { key: "all", label: "All" },
    ...STATUS_KEYS.map((key) => ({ key, label: Status[key], color: STATUS_STYLE[key].color })),
  ];

  return (
    <div className="tasks-page">
      <div className="page-header">
        <Title level={4}>
          <UnorderedListOutlined /> Tasks
        </Title>
        <div className="page-header-actions">
          <div className="stats-card">
            <Text type="secondary">Open Tasks</Text>
            <Text strong>{counts[1] + counts[2]}</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setForm({ open: true })}>
            Add Task
          </Button>
        </div>
      </div>

      <div className="tasks-body">
        <div className="tasks-toolbar">
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="tasks-search"
          />
          <div className="tasks-filter" role="tablist" aria-label="Filter by status">
            {filterOptions.map(({ key, label, color }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                className={`tasks-filter-btn${filter === key ? " is-active" : ""}`}
                onClick={() => setFilter(key)}
              >
                {color && <span className="tasks-filter-dot" style={{ background: color }} />}
                {label}
                <span className="tasks-filter-count">{counts[key]}</span>
              </button>
            ))}
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="tasks-empty">
            <InboxOutlined style={{ fontSize: 32, color: "#94a3b8" }} />
            {tasks.length === 0 ? (
              <>
                <p className="tasks-empty-title">No tasks yet</p>
                <p className="tasks-empty-text">Create your first task and it will show up here.</p>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setForm({ open: true })}>
                  Add Task
                </Button>
              </>
            ) : (
              <>
                <p className="tasks-empty-title">No matching tasks</p>
                <p className="tasks-empty-text">Try a different search or status filter.</p>
                <Button
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </>
            )}
          </div>
        ) : (
          groups.map(([date, items]) => {
            const rel = relativeDay(date);
            const near = NEAR_DAYS.has(rel);
            return (
              <section key={date} className={`tasks-group${date === todayISO() ? " is-today" : ""}`}>
                <div className="tasks-group-head">
                  <span className="tasks-group-title">{near ? rel : mediumDate(date)}</span>
                  <span className="tasks-group-sub">{near ? mediumDate(date) : rel}</span>
                  <span className="tasks-group-count">
                    {items.length} {items.length === 1 ? "task" : "tasks"}
                  </span>
                </div>

                <div className="tasks-list">
                  {items.map((task) => {
                    const status = toStatus(task.status);
                    const { color, icon } = STATUS_STYLE[status];
                    return (
                      <button
                        key={task.id}
                        type="button"
                        className={`task-row${status === 3 ? " is-done" : ""}`}
                        onClick={() => setViewTaskId(task.id)}
                      >
                        <span className="task-row-icon" style={{ color, background: `${color}17` }}>
                          {icon}
                        </span>
                        <div className="task-row-main">
                          <div className="task-row-title">{task.title || "Untitled task"}</div>
                          <div className={`task-row-desc${task.desc ? "" : " is-empty"}`}>
                            {task.desc || "No description"}
                          </div>
                        </div>
                        <span className="td-status-pill" style={{ color, background: `${color}1a` }}>
                          {Status[status]}
                        </span>
                        <RightOutlined className="task-row-arrow" />
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>

      <TaskDetailModal
        task={viewTask}
        onClose={() => setViewTaskId(null)}
        onEdit={(task) => {
          setViewTaskId(null);
          setForm({ open: true, task });
        }}
        onDelete={(task) => {
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
          setViewTaskId(null);
        }}
        onStatusChange={(task, status) =>
          setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)))
        }
      />

      <TaskFormModal
        open={form.open}
        task={form.task}
        onClose={() => setForm((f) => ({ ...f, open: false }))}
        onSave={handleSave}
      />
    </div>
  );
};

export default Tasks;
