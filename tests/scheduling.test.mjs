import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSchedule } from '../src/lib/scheduling.ts';
const hours={start:'09:00',end:'12:00',breaks:[{start:'10:00',end:'10:30'}]};
const now=new Date(2026,10,16,8,0);
const task=(id,overrides={})=>({id,title:id,date:'2026-11-16',desc:'',status:1,priority:'medium',estimatedMinutes:30,...overrides});
test('respects breaks and existing task blocks',()=>{
 const result=buildSchedule([task('existing',{startTime:'09:00',endTime:'09:30'}),task('new')],hours,now,1);
 assert.deepEqual(result.suggestions.map(s=>[s.taskId,s.start,s.end]),[['new','09:30','10:00']]);
});
test('orders urgent tasks first and never applies them',()=>{
 const tasks=[task('low',{priority:'low'}),task('urgent',{priority:'urgent'})];
 const result=buildSchedule(tasks,hours,now,1);
 assert.equal(result.suggestions[0].taskId,'urgent');
 assert.equal(tasks[0].startTime,undefined);
});
test('reports conflicts and tasks that do not fit',()=>{
 const result=buildSchedule([task('a',{startTime:'09:00',endTime:'10:00'}),task('b',{startTime:'09:30',endTime:'10:00'}),task('long',{estimatedMinutes:240})],hours,now,1);
 assert.ok(result.conflicts.some(c=>c.labels.includes('a')&&c.labels.includes('b')));
 assert.deepEqual(result.unscheduledTaskIds,['long']);
 assert.equal(result.days[0].overloaded,true);
});
test('rejects invalid working hours',()=>assert.throws(()=>buildSchedule([], {start:'17:00',end:'09:00',breaks:[]},now),/Working hours/));
