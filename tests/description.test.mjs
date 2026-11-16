import test from 'node:test';
import assert from 'node:assert/strict';
const values=new Map();
globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key),clear:()=>values.clear(),key:index=>[...values.keys()][index]??null,get length(){return values.size}};
const {normalizeTaskInput}=await import('../src/lib/taskInput.ts');
const {useTasksStore}=await import('../src/state/tasks.ts');
const draft={title:' Plan launch ',date:'2026-11-16',desc:'  Include review notes  ',status:1};
test('create, view, edit and persist a task description',()=>{
 const store=useTasksStore;
 const created=normalizeTaskInput(draft);
 store.getState().addTask(created);
 const task=store.getState().tasks[0];
 assert.equal(task.desc,'Include review notes');
 const edited=normalizeTaskInput({...task,desc:'  Revised description  '},task);
 store.getState().updateTask(task.id,edited);
 assert.equal(store.getState().tasks[0].desc,'Revised description');
 const saved=JSON.parse(values.get('scheduler-tasks-v2'));
 assert.equal(saved.state.tasks[0].desc,'Revised description');
 const cleared=normalizeTaskInput({...store.getState().tasks[0],desc:''},store.getState().tasks[0]);
 store.getState().updateTask(task.id,cleared);
 assert.equal(store.getState().tasks[0].desc,'');
});
test('rejects invalid title, date and description values',()=>{
 assert.throws(()=>normalizeTaskInput({...draft,title:'   '}),/title/);
 assert.throws(()=>normalizeTaskInput({...draft,date:'2026-02-30'}),/date/);
 assert.throws(()=>normalizeTaskInput({...draft,desc:{unexpected:true}}),/Description/);
 assert.throws(()=>normalizeTaskInput({...draft,desc:'x'.repeat(4001)}),/4,000/);
});
