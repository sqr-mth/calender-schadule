'use client';
import { Button, Card, Modal, message } from 'antd';
import { useTasksStore } from '@/state/tasks';
import { exportCalendar, importCalendar } from '@/lib/ical';
export default function CalendarFiles(){
 const {tasks,addTask}=useTasksStore();
 const download=()=>{const text=exportCalendar(tasks);const url=URL.createObjectURL(new Blob([text],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='forma-calendar.ics';a.click();URL.revokeObjectURL(url)};
 const upload=async(file:File)=>{try{const events=importCalendar(await file.text());const seen=new Set(tasks.map(t=>t.externalUid).filter(Boolean));const unseen=events.filter(e=>{if(seen.has(e.uid))return false;seen.add(e.uid);return true});if(!events.length){message.info('No supported events were found');return}Modal.confirm({title:`Import ${unseen.length} events?`,content:<div><p>{events.length-unseen.length} previously imported events will be skipped. All-day and UTC events are supported; other time zone formats are skipped.</p><div style={{maxHeight:180,overflow:'auto'}}>{unseen.slice(0,10).map(e=><p key={e.uid}>{e.date} · {e.title}</p>)}</div></div>,okText:'Import as tasks',onOk:()=>{for(const e of unseen)addTask({title:e.title,date:e.date,desc:'Imported from iCalendar',status:1,startTime:e.startTime,endTime:e.endTime,externalUid:e.uid});message.success(`Imported ${unseen.length} tasks`)}})}catch(e){Modal.error({title:'Could not read calendar',content:e instanceof Error?e.message:'Invalid file'})}};
 return <Card title="Calendar files" style={{marginTop:18}}><p>Export current workspace tasks or review events from an .ics file before importing.</p><Button onClick={download}>Export .ics</Button> <label className="import-label">Import .ics<input type="file" accept=".ics,text/calendar" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);e.target.value=''}}/></label></Card>
}
