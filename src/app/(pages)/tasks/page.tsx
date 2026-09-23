"use client";
import dynamic from 'next/dynamic';

const Tasks = dynamic(() => import('@/components/Tasks'), { ssr: false });

export default function TasksPage() {
  return (
    <div className="tasks-page">
      <div className="tasks-page-header">
        <h1>Tasks</h1>
        <p>All tasks, sorted by date.</p>
      </div>
      <Tasks />
    </div>
  );
}
