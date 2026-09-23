"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useTasksStore, Task, Status } from '@/state/tasks';
import { Input, Badge, Empty, Tooltip } from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchTasks = async (): Promise<Task[]> => {
  const { data } = await axios.get<Task[]>('/api');
  return data;
};

const STATUS_META: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
  1: { label: 'Pending',  color: '#f59e0b', icon: <ClockCircleOutlined /> },
  2: { label: 'Blocked',  color: '#ef4444', icon: <ExclamationCircleOutlined /> },
  3: { label: 'Done',     color: '#52c41a', icon: <CheckCircleOutlined /> },
};

const Tasks: React.FC = () => {
  const { tasks, setTasks } = useTasksStore();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: posts } = useQuery({ queryKey: ['postsData'], queryFn: fetchTasks });

  // Seed store with API tasks (same as Calendar)
  useEffect(() => {
    if (!posts?.length) return;
    setTasks((prev) => {
      const ids = new Set(prev.map((t) => t.id));
      const incoming = posts.filter((t) => !ids.has(t.id));
      return incoming.length ? [...prev, ...incoming] : prev;
    });
  }, [posts]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Filter + group by date, sorted ascending
  const grouped = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const filtered = q
      ? tasks.filter(
          (t) =>
            t.title?.toLowerCase().includes(q) ||
            t.desc?.toLowerCase().includes(q) ||
            t.date?.includes(q),
        )
      : tasks;

    const map: Record<string, Task[]> = {};
    for (const task of filtered) {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [tasks, searchTerm]);

  return (
    <div className="tasks-root">
      <Input
        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        allowClear
        className="tasks-search"
        size="large"
      />

      {grouped.length === 0 ? (
        <Empty
          description={
            searchTerm
              ? 'No tasks match your search.'
              : 'No tasks yet. Add one from the Calendar.'
          }
          className="tasks-empty"
        />
      ) : (
        <div className="tasks-groups">
          {grouped.map(([date, items]) => (
            <div key={date} className="task-group">
              <div className="task-group-header">
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <span>{date}</span>
                <span className="task-group-count">{items.length}</span>
              </div>

              <div className="task-cards">
                {items.map((task) => {
                  const statusNum = Number(task.status) || 1;
                  const meta = STATUS_META[statusNum] ?? STATUS_META[1];

                  return (
                    <div key={task.id} className={`task-card status-border-${statusNum}`}>
                      <div className="task-card-body">
                        <div className="task-card-title">{task.title || '—'}</div>
                        {task.desc && (
                          <div className="task-card-desc">{task.desc}</div>
                        )}
                      </div>
                      <div className="task-card-right">
                        <Badge
                          color={meta.color}
                          text={
                            <span style={{ fontSize: '0.75rem', color: meta.color, fontWeight: 600 }}>
                              {meta.label}
                            </span>
                          }
                        />
                        <Tooltip title="Delete task">
                          <button
                            className="task-delete-btn"
                            onClick={() => handleDelete(task.id)}
                            aria-label="Delete task"
                          >
                            <DeleteOutlined />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
