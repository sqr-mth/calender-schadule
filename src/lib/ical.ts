import type { Task } from '@/state/tasks';
export interface ImportedEvent { uid: string; title: string; date: string; startTime?: string; endTime?: string; }
const escapeText=(value:string)=>value.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const unescapeText=(value:string)=>value.replace(/\\([nN,;\\])/g,(_,c:string)=>c==='n'||c==='N'?'\n':c);
const utc=(date:Date)=>date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const localKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const localTime=(d:Date)=>`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
function fold(line:string){const encoder=new TextEncoder();let result='',chunk='',limit=75;for(const char of line){if(encoder.encode(chunk+char).length>limit){result+=chunk+'\r\n ';chunk=char;limit=74}else chunk+=char}return result+chunk}
export function exportCalendar(tasks:Task[]):string {
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Forma//Local Calendar//EN'];
 for(const task of tasks.filter(t=>!t.deletedAt&&!t.archived&&/^\d{4}-\d{2}-\d{2}$/.test(t.date))){
  lines.push('BEGIN:VEVENT',`UID:${encodeURIComponent(task.id)}@forma.local`,`DTSTAMP:${utc(new Date())}`,`SUMMARY:${escapeText(task.title)}`);
  if(task.desc)lines.push(`DESCRIPTION:${escapeText(task.desc)}`);
  if(task.startTime){const start=new Date(`${task.date}T${task.startTime}:00`);const end=task.endTime?new Date(`${task.date}T${task.endTime}:00`):new Date(start.getTime()+(task.estimatedMinutes??30)*60000);if(Number.isFinite(start.getTime())&&Number.isFinite(end.getTime())&&end>start)lines.push(`DTSTART:${utc(start)}`,`DTEND:${utc(end)}`)}
  else{const day=new Date(`${task.date}T12:00:00`);day.setDate(day.getDate()+1);lines.push(`DTSTART;VALUE=DATE:${task.date.replace(/-/g,'')}`,`DTEND;VALUE=DATE:${localKey(day).replace(/-/g,'')}`)}
  lines.push('END:VEVENT');
 }
 lines.push('END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';
}
export function importCalendar(source:string):ImportedEvent[]{
 if(source.length>2_000_000)throw new Error('Calendar file is too large');
 const lines=source.replace(/\r?\n[ \t]/g,'').split(/\r?\n/);if(lines[0]!=='BEGIN:VCALENDAR'||!lines.includes('END:VCALENDAR'))throw new Error('Invalid calendar file');
 const result:ImportedEvent[]=[];let event:Record<string,string>|null=null;
 for(const line of lines){if(line==='BEGIN:VEVENT'){event={};continue}if(line==='END:VEVENT'){if(event){const raw=event.DTSTART;const title=event.SUMMARY;const uid=event.UID;if(raw&&title&&uid){let date:string|undefined,startTime:string|undefined;if(/^\d{8}$/.test(raw))date=`${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`;else if(/^\d{8}T\d{6}Z$/.test(raw)){const d=new Date(`${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}T${raw.slice(9,11)}:${raw.slice(11,13)}:${raw.slice(13,15)}Z`);if(Number.isFinite(d.getTime())){date=localKey(d);startTime=localTime(d)}}if(date&&Number.isFinite(new Date(`${date}T12:00:00`).getTime())){let endTime:string|undefined;const end=event.DTEND;if(end&&/^\d{8}T\d{6}Z$/.test(end)){const d=new Date(`${end.slice(0,4)}-${end.slice(4,6)}-${end.slice(6,8)}T${end.slice(9,11)}:${end.slice(11,13)}:${end.slice(13,15)}Z`);if(Number.isFinite(d.getTime())&&localKey(d)===date)endTime=localTime(d)}result.push({uid,title:unescapeText(title).slice(0,120),date,startTime,endTime})}}}event=null;continue}if(event){const pos=line.indexOf(':');if(pos<0)continue;const key=line.slice(0,pos).split(';')[0].toUpperCase();if(['UID','SUMMARY','DTSTART','DTEND'].includes(key))event[key]=line.slice(pos+1)}}
 return result;
}
