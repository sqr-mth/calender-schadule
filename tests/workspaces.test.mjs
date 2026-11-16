import test from 'node:test';
import assert from 'node:assert/strict';
const values=new Map();
globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key),clear:()=>values.clear(),key:index=>[...values.keys()][index]??null,get length(){return values.size}};
const {useTasksStore}=await import('../src/state/tasks.ts');
test('switching workspaces isolates task data and retains the original workspace',()=>{
 const store=useTasksStore;
 store.getState().addTask({title:'Personal task',date:'2026-11-16',desc:''});
 store.getState().createWorkspace('Work');
 assert.equal(store.getState().tasks.length,0);
 store.getState().addTask({title:'Work task',date:'2026-11-16',desc:''});
 store.getState().switchWorkspace('personal');
 assert.deepEqual(store.getState().tasks.map(t=>t.title),['Personal task']);
 const work=store.getState().workspaces.find(w=>w.name==='Work');
 store.getState().switchWorkspace(work.id);
 assert.deepEqual(store.getState().tasks.map(t=>t.title),['Work task']);
});
test('last workspace cannot be deleted',()=>{
 const store=useTasksStore;
 const work=store.getState().workspaces.find(w=>w.name==='Work');
 store.getState().deleteWorkspace('personal');
 assert.equal(store.getState().workspaces.length,1);
 store.getState().deleteWorkspace(work.id);
 assert.equal(store.getState().workspaces.length,1);
});
