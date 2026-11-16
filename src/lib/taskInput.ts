import type { Priority, StatusKey, Task } from '@/state/tasks';

const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) &&
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` === value;
};

export function normalizeTaskInput(values: Partial<Task>, existing?: Task): Task {
  if (typeof values.title !== 'string' || !values.title.trim()) throw new Error('Enter a task title.');
  if (typeof values.date !== 'string' || !isValidDate(values.date)) throw new Error('Choose a valid due date.');
  if (values.desc != null && typeof values.desc !== 'string') throw new Error('Description must be text.');
  if (values.priority != null && !priorities.includes(values.priority)) throw new Error('Choose a valid priority.');
  if (values.status != null && !([1, 2, 3] as StatusKey[]).includes(values.status)) throw new Error('Choose a valid status.');
  if (values.estimatedMinutes != null && (!Number.isFinite(values.estimatedMinutes) || values.estimatedMinutes < 0)) throw new Error('Enter a valid duration.');
  if (values.projectId != null && typeof values.projectId !== 'string') throw new Error('Choose a valid project.');
  const desc = (values.desc ?? '').trim();
  if (desc.length > 4000) throw new Error('Description must be 4,000 characters or less.');
  return {
    ...(existing ?? {}),
    ...values,
    id: existing?.id ?? '',
    title: values.title.trim(),
    desc,
    date: values.date,
    status: values.status ?? existing?.status ?? 1,
    priority: values.priority ?? existing?.priority ?? 'medium',
  };
}
