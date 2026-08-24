"use client";
// next/dynamic with ssr:false must be inside a Client Component (Next.js 15 rule).
// Recoil does not support server rendering.
import dynamic from 'next/dynamic';

const Tasks = dynamic(() => import('@/components/Tasks'), { ssr: false });

export default function TasksPage() {
  return (
    <div className="tasks-page">
      <div className="tasks-page-header">
        <h1>All Tasks</h1>
        <p>A chronological list of every task across all dates.</p>
      </div>
      <Tasks />
    </div>
  );
}
