import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const Status = { 1: 'Pending', 2: 'Blocked', 3: 'Done' } as const;
export type StatusKey = 1 | 2 | 3;
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export interface Task {
  id: string; title: string; date: string; desc: string; status?: StatusKey;
  priority?: Priority; startDate?: string; startTime?: string; endTime?: string;
  estimatedMinutes?: number; actualMinutes?: number; category?: string;
  projectId?: string; tags?: string[]; subtasks?: { id: string; title: string; done: boolean }[];
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly'; attachmentNames?: string[];
  dependencyIds?: string[]; externalUid?: string; archived?: boolean; deletedAt?: string;
  createdAt?: string; updatedAt?: string; completedAt?: string;
}
export interface Project { id: string; title: string; description: string; deadline?: string; priority: Priority; archived?: boolean; createdAt: string; }
export interface Goal { id: string; title: string; description: string; period: 'daily' | 'weekly' | 'monthly' | 'long-term'; target: number; progress: number; deadline?: string; }
export interface Habit { id: string; title: string; frequency: 'daily' | 'weekly'; completedDates: string[]; }
export interface Note { id: string; title: string; content: string; pinned: boolean; updatedAt: string; }
export interface TimeEntry { id: string; taskId?: string; projectId?: string; startedAt: string; minutes: number; }
export interface Activity { id: string; label: string; at: string; }
export interface Workspace { id: string; name: string; createdAt: string; workingHours?: { start: string; end: string; breaks: { start: string; end: string }[] }; }
export interface WorkspaceData { tasks: Task[]; projects: Project[]; goals: Goal[]; habits: Habit[]; notes: Note[]; timeEntries: TimeEntry[]; activity: Activity[]; }
const emptyData = (): WorkspaceData => ({ tasks: [], projects: [], goals: [], habits: [], notes: [], timeEntries: [], activity: [] });
const dataOf = (s: WorkspaceData): WorkspaceData => ({ tasks: s.tasks, projects: s.projects, goals: s.goals, habits: s.habits, notes: s.notes, timeEntries: s.timeEntries, activity: s.activity });
const defaultWorkspace: Workspace = { id: 'personal', name: 'Personal', createdAt: '2026-01-01T00:00:00.000Z' };

interface Store {
 workspaces: Workspace[]; activeWorkspaceId: string; workspaceData: Record<string, WorkspaceData>;
 createWorkspace: (name: string) => void; switchWorkspace: (id: string) => void; renameWorkspace: (id: string, name: string) => void; updateWorkspaceHours: (id: string, hours: NonNullable<Workspace['workingHours']>) => void; deleteWorkspace: (id: string) => void;
 tasks: Task[]; projects: Project[]; goals: Goal[]; habits: Habit[]; notes: Note[]; timeEntries: TimeEntry[]; activity: Activity[];
 setTasks: (updater: Task[] | ((prev: Task[]) => Task[])) => void;
 addTask: (data: Omit<Task, 'id'>) => void; updateTask: (id: string, patch: Partial<Task>) => void;
 addProject: (data: Omit<Project, 'id' | 'createdAt'>) => void; updateProject: (id: string, patch: Partial<Project>) => void; deleteProject: (id: string) => void;
 addGoal: (data: Omit<Goal, 'id'>) => void; updateGoal: (id: string, patch: Partial<Goal>) => void; deleteGoal: (id: string) => void;
 addHabit: (title: string, frequency: Habit['frequency']) => void; toggleHabit: (id: string, date: string) => void; deleteHabit: (id: string) => void;
 addNote: (title: string, content: string) => void; updateNote: (id: string, patch: Partial<Note>) => void; deleteNote: (id: string) => void;
 addTimeEntry: (data: Omit<TimeEntry, 'id'>) => void;
 importData: (data: Partial<WorkspaceData>) => void;
 importBackup: (data: unknown) => void;
}
const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
const log = (label: string): Activity => ({ id: uid(), label, at: new Date().toISOString() });
export const useTasksStore = create<Store>()(persist((set) => ({
 tasks: [], projects: [], goals: [], habits: [], notes: [], timeEntries: [], activity: [],
 workspaces: [defaultWorkspace], activeWorkspaceId: defaultWorkspace.id, workspaceData: {},
 createWorkspace: (name) => set(s => { const trimmed = name.trim(); if (!trimmed) return s; const id = uid(); return { ...emptyData(), workspaces: [...s.workspaces, { id, name: trimmed, createdAt: new Date().toISOString() }], activeWorkspaceId: id, workspaceData: { ...s.workspaceData, [s.activeWorkspaceId]: dataOf(s) } }; }),
 switchWorkspace: (id) => set(s => s.workspaces.some(w => w.id === id) && id !== s.activeWorkspaceId ? { ...dataOf(s.workspaceData[id] ?? emptyData()), activeWorkspaceId: id, workspaceData: { ...s.workspaceData, [s.activeWorkspaceId]: dataOf(s) } } : s),
 renameWorkspace: (id, name) => set(s => ({ workspaces: s.workspaces.map(w => w.id === id && name.trim() ? { ...w, name: name.trim() } : w) })),
 updateWorkspaceHours: (id, hours) => set(s => ({ workspaces: s.workspaces.map(w => w.id === id ? { ...w, workingHours: hours } : w) })),
 deleteWorkspace: (id) => set(s => { if (s.workspaces.length <= 1 || !s.workspaces.some(w => w.id === id)) return s; const workspaces = s.workspaces.filter(w => w.id !== id); const workspaceData = { ...s.workspaceData }; delete workspaceData[id]; if (id !== s.activeWorkspaceId) return { workspaces, workspaceData }; const next = workspaces[0]; return { ...dataOf(workspaceData[next.id] ?? emptyData()), workspaces, workspaceData, activeWorkspaceId: next.id }; }),
 setTasks: (updater) => set(s => ({ tasks: typeof updater === 'function' ? updater(s.tasks) : updater })),
 addTask: (data) => set(s => ({ tasks: [...s.tasks, { ...data, id: uid(), createdAt: new Date().toISOString() }], activity: [log(`Created task: ${data.title}`), ...s.activity].slice(0, 100) })),
 updateTask: (id, patch) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString(), completedAt: patch.status === 3 ? new Date().toISOString() : patch.status ? undefined : t.completedAt } : t), activity: [log(`Updated task: ${s.tasks.find(t => t.id === id)?.title ?? 'Task'}`), ...s.activity].slice(0, 100) })),
 addProject: (data) => set(s => ({ projects: [...s.projects, { ...data, id: uid(), createdAt: new Date().toISOString() }], activity: [log(`Created project: ${data.title}`), ...s.activity].slice(0, 100) })),
 updateProject: (id, patch) => set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...patch } : p) })),
 deleteProject: (id) => set(s => ({ projects: s.projects.filter(p => p.id !== id), tasks: s.tasks.map(t => t.projectId === id ? { ...t, projectId: undefined } : t) })),
 addGoal: (data) => set(s => ({ goals: [...s.goals, { ...data, id: uid() }] })),
 updateGoal: (id, patch) => set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...patch } : g) })),
 deleteGoal: (id) => set(s => ({ goals: s.goals.filter(g => g.id !== id) })),
 addHabit: (title, frequency) => set(s => ({ habits: [...s.habits, { id: uid(), title, frequency, completedDates: [] }] })),
 toggleHabit: (id, date) => set(s => ({ habits: s.habits.map(h => h.id === id ? { ...h, completedDates: h.completedDates.includes(date) ? h.completedDates.filter(d => d !== date) : [...h.completedDates, date] } : h), activity: [log('Updated habit'), ...s.activity].slice(0, 100) })),
 deleteHabit: (id) => set(s => ({ habits: s.habits.filter(h => h.id !== id) })),
 addNote: (title, content) => set(s => ({ notes: [...s.notes, { id: uid(), title, content, pinned: false, updatedAt: new Date().toISOString() }] })),
 updateNote: (id, patch) => set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n) })),
 deleteNote: (id) => set(s => ({ notes: s.notes.filter(n => n.id !== id) })),
 addTimeEntry: (data) => set(s => ({ timeEntries: [...s.timeEntries, { ...data, id: uid() }] })),
 importBackup: (data) => set(s => {
  if (!data || typeof data !== 'object') throw new Error('Invalid backup');
  const backup = data as { workspaces?: unknown; activeWorkspaceId?: unknown; workspaceData?: unknown; current?: unknown };
  if (!Array.isArray(backup.workspaces) || !backup.workspaces.length || typeof backup.activeWorkspaceId !== 'string' || !backup.workspaces.some((w: Workspace) => w?.id === backup.activeWorkspaceId) || !backup.current || typeof backup.current !== 'object') throw new Error('Invalid backup');
  const ids = new Set<string>();
  for (const w of backup.workspaces as Workspace[]) { if (typeof w?.id !== 'string' || typeof w?.name !== 'string' || ids.has(w.id)) throw new Error('Invalid workspace'); ids.add(w.id); }
  const current = backup.current as WorkspaceData;
  if (!Array.isArray(current.tasks) || !Array.isArray(current.projects) || !Array.isArray(current.goals) || !Array.isArray(current.habits) || !Array.isArray(current.notes) || !Array.isArray(current.timeEntries) || !Array.isArray(current.activity)) throw new Error('Invalid workspace data');
  const raw = backup.workspaceData as Record<string, WorkspaceData> | undefined;
  const workspaceData: Record<string, WorkspaceData> = {};
  for (const id of ids) { if (id === backup.activeWorkspaceId) continue; const entry = raw?.[id]; if (!entry || !Array.isArray(entry.tasks) || !Array.isArray(entry.projects) || !Array.isArray(entry.goals) || !Array.isArray(entry.habits) || !Array.isArray(entry.notes) || !Array.isArray(entry.timeEntries) || !Array.isArray(entry.activity)) throw new Error('Invalid workspace data'); workspaceData[id] = entry; }
  return { ...dataOf(current), workspaces: backup.workspaces as Workspace[], activeWorkspaceId: backup.activeWorkspaceId as string, workspaceData };
 }),
 importData: (data) => set(s => ({ ...s, tasks: Array.isArray(data.tasks) ? data.tasks.filter(t => typeof t?.id === 'string' && typeof t?.title === 'string' && typeof t?.date === 'string') : s.tasks, projects: Array.isArray(data.projects) ? data.projects.filter(p => typeof p?.id === 'string' && typeof p?.title === 'string') : s.projects, goals: Array.isArray(data.goals) ? data.goals.filter(g => typeof g?.id === 'string' && typeof g?.title === 'string') : s.goals, habits: Array.isArray(data.habits) ? data.habits.filter(h => typeof h?.id === 'string' && typeof h?.title === 'string' && Array.isArray(h.completedDates)) : s.habits, notes: Array.isArray(data.notes) ? data.notes.filter(n => typeof n?.id === 'string' && typeof n?.title === 'string') : s.notes, timeEntries: Array.isArray(data.timeEntries) ? data.timeEntries.filter(e => typeof e?.id === 'string' && typeof e?.minutes === 'number') : s.timeEntries, activity: Array.isArray(data.activity) ? data.activity : s.activity })),
}), { name: 'scheduler-tasks-v2', version: 3, storage: createJSONStorage(() => localStorage), migrate: (persisted) => {
 const old = persisted as Partial<Store>;
 const current = { tasks: Array.isArray(old.tasks) ? old.tasks : [], projects: Array.isArray(old.projects) ? old.projects : [], goals: Array.isArray(old.goals) ? old.goals : [], habits: Array.isArray(old.habits) ? old.habits : [], notes: Array.isArray(old.notes) ? old.notes : [], timeEntries: Array.isArray(old.timeEntries) ? old.timeEntries : [], activity: Array.isArray(old.activity) ? old.activity : [] };
 return { ...old, ...current, workspaces: Array.isArray(old.workspaces) && old.workspaces.length ? old.workspaces : [defaultWorkspace], activeWorkspaceId: old.activeWorkspaceId ?? defaultWorkspace.id, workspaceData: old.workspaceData && typeof old.workspaceData === 'object' ? old.workspaceData : {} } as Store;
} }));
