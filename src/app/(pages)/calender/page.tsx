"use client";
// next/dynamic with ssr:false must be inside a Client Component (Next.js 15 rule).
// Recoil does not support server rendering.
import dynamic from 'next/dynamic';

const CalenderComponent = dynamic(
  () => import('@/components/Calender/Calendar'),
  { ssr: false },
);

export default function CalendarPage() {
  return <CalenderComponent />;
}
