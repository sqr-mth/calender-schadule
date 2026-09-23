"use client";
import dynamic from 'next/dynamic';

const CalenderComponent = dynamic(
  () => import('@/components/Calender/Calendar'),
  { ssr: false },
);

export default function CalendarPage() {
  return <CalenderComponent />;
}
