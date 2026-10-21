import React from "react";
import {
  CheckCircleFilled,
  ClockCircleFilled,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { StatusKey } from "@/state/tasks";

export const STATUS_KEYS: StatusKey[] = [1, 2, 3];

export const STATUS_STYLE: Record<StatusKey, { color: string; icon: React.ReactNode }> = {
  1: { color: "#f59e0b", icon: <ClockCircleFilled /> },
  2: { color: "#ef4444", icon: <ExclamationCircleFilled /> },
  3: { color: "#22a06b", icon: <CheckCircleFilled /> },
};

export const toStatus = (s: unknown): StatusKey => {
  const n = Number(s);
  return n === 2 || n === 3 ? n : 1;
};

/** Local-time YYYY-MM-DD (toISOString would give the UTC date). */
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const parse = (date: string) => new Date(`${date}T00:00:00`);

export const formatDate = (date: string) =>
  parse(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export const shortDate = (date: string) =>
  parse(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const mediumDate = (date: string) =>
  parse(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

export const relativeDay = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((parse(date).getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return diff > 0 ? `In ${diff} days` : `${-diff} days ago`;
};
