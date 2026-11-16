import test from 'node:test';
import assert from 'node:assert/strict';
import { exportCalendar, importCalendar } from '../src/lib/ical.ts';
test('exports and reimports all-day tasks',()=>{
 const text=exportCalendar([{id:'one',title:'Review, plan',date:'2026-11-16',desc:'',status:1}]);
 assert.match(text,/DTSTART;VALUE=DATE:20261116/);
 assert.deepEqual(importCalendar(text).map(e=>[e.title,e.date]),[['Review, plan','2026-11-16']]);
});
test('rejects non-calendar input',()=>assert.throws(()=>importCalendar('plain text'),/Invalid calendar/));

test('exports timed tasks as UTC without losing local placement',()=>{
 const text=exportCalendar([{id:'timed',title:'Call',date:'2026-11-16',startTime:'09:00',endTime:'09:30',desc:''}]);
 const imported=importCalendar(text)[0];
 assert.equal(imported.date,'2026-11-16');assert.equal(imported.startTime,'09:00');assert.equal(imported.endTime,'09:30');
});
