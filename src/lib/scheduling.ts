import type { Task, Priority } from '@/state/tasks';

export interface WorkingHours { start: string; end: string; breaks: { start: string; end: string }[]; }
export interface BusySlot { date: string; start: string; end: string; label: string; }
export interface ScheduleSuggestion { taskId: string; date: string; start: string; end: string; minutes: number; reason: string; }
export interface DayLoad { date: string; availableMinutes: number; bookedMinutes: number; remainingMinutes: number; overloaded: boolean; }
export interface ScheduleResult { suggestions: ScheduleSuggestion[]; unscheduledTaskIds: string[]; conflicts: { date: string; labels: string[] }[]; days: DayLoad[]; }
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const minutes = (time: string) => { const match = /^(\d{2}):(\d{2})$/.exec(time); if (!match) return NaN; const h=Number(match[1]),m=Number(match[2]); return h<24&&m<60?h*60+m:NaN; };
const clock = (value: number) => `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;
const overlaps = (a:{start:number;end:number},b:{start:number;end:number}) => a.start<b.end&&b.start<a.end;
const priorityRank:Record<Priority,number>={urgent:4,high:3,medium:2,low:1};
export function buildSchedule(tasks: Task[], config: WorkingHours, now: Date, horizonDays=7, externalBusy: BusySlot[]=[]): ScheduleResult {
 const start=minutes(config.start),end=minutes(config.end);
 if (!Number.isFinite(start)||!Number.isFinite(end)||end<=start) throw new Error('Working hours must have a valid start and end.');
 const breaks=config.breaks.map(b=>({start:minutes(b.start),end:minutes(b.end)}));
 if (breaks.some(b=>!Number.isFinite(b.start)||!Number.isFinite(b.end)||b.end<=b.start||b.start<start||b.end>end)) throw new Error('Breaks must fall within working hours.');
 const days=Array.from({length:horizonDays},(_,i)=>{const d=new Date(now);d.setHours(12,0,0,0);d.setDate(d.getDate()+i);return dateKey(d)});
 const booked=new Map<string,{start:number;end:number;label:string}[]>();
 for(const date of days)booked.set(date,breaks.map(b=>({...b,label:'Break'})));
 for(const task of tasks){if(task.deletedAt||task.archived||task.status===3||!task.startTime)continue;const s=minutes(task.startTime),e=task.endTime?minutes(task.endTime):s+(task.estimatedMinutes??30);if(booked.has(task.date)&&Number.isFinite(s)&&Number.isFinite(e)&&e>s)booked.get(task.date)!.push({start:s,end:e,label:task.title});}
 for(const busy of externalBusy){const s=minutes(busy.start),e=minutes(busy.end);if(booked.has(busy.date)&&Number.isFinite(s)&&Number.isFinite(e)&&e>s)booked.get(busy.date)!.push({start:s,end:e,label:busy.label});}
 const conflicts:ScheduleResult['conflicts']=[];
 for(const [date,slots] of booked){for(let i=0;i<slots.length;i++)for(let j=i+1;j<slots.length;j++)if(overlaps(slots[i],slots[j]))conflicts.push({date,labels:[slots[i].label,slots[j].label]});}
 const candidates=tasks.filter(t=>!t.deletedAt&&!t.archived&&t.status!==3&&!t.startTime).sort((a,b)=>(priorityRank[b.priority??'medium']-priorityRank[a.priority??'medium'])||a.date.localeCompare(b.date)||a.title.localeCompare(b.title));
 const suggestions:ScheduleSuggestion[]=[];const unscheduledTaskIds:string[]=[];
 for(const task of candidates){const duration=Math.max(15,Math.min(240,task.estimatedMinutes??30));let placed=false;
  for(const date of days){if(task.date&&task.date>=dateKey(now)&&date>task.date)continue;const today=date===dateKey(now);const earliest=today?Math.max(start,Math.ceil((now.getHours()*60+now.getMinutes())/15)*15):start;const slots=booked.get(date)!;
   for(let at=earliest;at+duration<=end;at+=15){const slot={start:at,end:at+duration};if(slots.every(b=>!overlaps(slot,b))){slots.push({...slot,label:task.title});suggestions.push({taskId:task.id,date,start:clock(at),end:clock(at+duration),minutes:duration,reason:`${task.priority??'medium'} priority · due ${task.date}`});placed=true;break;}}
   if(placed)break;
  }
  if(!placed)unscheduledTaskIds.push(task.id);
 }
 const loads=days.map(date=>{const slots=booked.get(date)!;const availableMinutes=end-start-breaks.reduce((n,b)=>n+b.end-b.start,0);const bookedMinutes=slots.filter(s=>s.label!=='Break').reduce((n,s)=>n+Math.max(0,Math.min(end,s.end)-Math.max(start,s.start)),0);return {date,availableMinutes,bookedMinutes,remainingMinutes:Math.max(0,availableMinutes-bookedMinutes),overloaded:bookedMinutes>availableMinutes||unscheduledTaskIds.some(id=>tasks.find(t=>t.id===id)?.date===date)};});
 return {suggestions,unscheduledTaskIds,conflicts,days:loads};
}
