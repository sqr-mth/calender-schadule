import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const Status = {
  1: 'Pending',
  2: 'Blocked',
  3: 'Done',
} as const;

export type StatusKey = 1 | 2 | 3;

export interface Task {
  id: string;
  title: string;
  date: string;
  desc: string;
  status?: StatusKey;
}

interface TasksStore {
  tasks: Task[];
  setTasks: (updater: Task[] | ((prev: Task[]) => Task[])) => void;
}

export const useTasksStore = create<TasksStore>()(
  persist(
    (set) => ({
      tasks: [],
      setTasks: (updater) =>
        set((state) => ({
          tasks: typeof updater === 'function' ? updater(state.tasks) : updater,
        })),
    }),
    {
      name: 'scheduler-tasks-v2',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage),
      ),
    },
  ),
);
