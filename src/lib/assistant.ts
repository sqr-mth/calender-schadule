import type { Task, TimeEntry, Habit } from '@/state/tasks';
import { buildSchedule, type WorkingHours } from './scheduling';
export interface AssistantContext { tasks: Task[]; timeEntries: TimeEntry[]; habits: Habit[]; now: Date; workingHours: WorkingHours; }
export interface AssistantReply { text: string; source: 'ai' | 'local-analysis'; }
export interface AIProvider { readonly id: string; readonly configured: boolean; answer(question: string, context: AssistantContext): Promise<AssistantReply>; summarizeWeek(context: AssistantContext): Promise<AssistantReply>; }
export class UnconfiguredAIProvider implements AIProvider {
 readonly id='unconfigured'; readonly configured=false;
 async answer():Promise<AssistantReply>{throw new Error('AI provider is not configured. Connect a server-side provider before using AI chat.');}
 async summarizeWeek():Promise<AssistantReply>{throw new Error('AI provider is not configured. Connect a server-side provider before generating AI summaries.');}
}
export const aiProvider:AIProvider=new UnconfiguredAIProvider();
export interface LocalInsights { openTasks:number; overdueTasks:number; completedThisWeek:number; focusMinutesThisWeek:number; overloadedDays:string[]; recommendedTaskIds:string[]; summary:string; }
export function analyzeLocally(context:AssistantContext):LocalInsights {
 const {tasks,timeEntries,now,workingHours}=context;const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());const weekStart=new Date(today);weekStart.setDate(today.getDate()-6);
 const active=tasks.filter(t=>!t.deletedAt&&!t.archived);const open=active.filter(t=>t.status!==3);const todayKey=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
 const completedThisWeek=active.filter(t=>t.status===3&&t.completedAt&&new Date(t.completedAt)>=weekStart).length;
 const focusMinutesThisWeek=timeEntries.filter(e=>new Date(e.startedAt)>=weekStart).reduce((n,e)=>n+e.minutes,0);
 const schedule=buildSchedule(active,workingHours,now);
 const recommendedTaskIds=schedule.suggestions.slice(0,3).map(s=>s.taskId);
 return {openTasks:open.length,overdueTasks:open.filter(t=>t.date<todayKey).length,completedThisWeek,focusMinutesThisWeek,overloadedDays:schedule.days.filter(d=>d.overloaded).map(d=>d.date),recommendedTaskIds,summary:`In the last seven days, you completed ${completedThisWeek} tasks and tracked ${Math.round(focusMinutesThisWeek/60*10)/10} focus hours. You have ${open.length} open tasks, including ${open.filter(t=>t.date<todayKey).length} overdue.`};
}
