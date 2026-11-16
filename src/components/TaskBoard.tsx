'use client';
import { useState } from 'react';
import { Empty } from 'antd';
import { Status, StatusKey, Task } from '@/state/tasks';
import { toStatus } from './Calender/taskMeta';
export default function TaskBoard({tasks,onOpen,onMove}:{tasks:Task[];onOpen:(id:string)=>void;onMove:(id:string,status:StatusKey)=>void}){
 const [dragId,setDragId]=useState<string|null>(null);
 return <div className="task-board">{([1,2,3] as StatusKey[]).map(status=><section className="board-column" key={status} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragId)onMove(dragId,status);setDragId(null)}}><div className="board-heading"><span className={`board-status status-${status}`}/><strong>{Status[status]}</strong><small>{tasks.filter(t=>toStatus(t.status)===status).length}</small></div>{tasks.filter(t=>toStatus(t.status)===status).map(t=><button key={t.id} type="button" draggable onDragStart={()=>setDragId(t.id)} onDragEnd={()=>setDragId(null)} className="board-card" onClick={()=>onOpen(t.id)}><strong>{t.title}</strong><span>{t.date}</span><small>{t.priority??'medium'} priority</small></button>)}{!tasks.some(t=>toStatus(t.status)===status)&&<div className="board-empty">Drop tasks here</div>}</section>)}</div>
}
