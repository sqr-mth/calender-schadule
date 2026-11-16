import test from 'node:test';
import assert from 'node:assert/strict';
const values=new Map([['scheduler-tasks-v2',JSON.stringify({state:{tasks:[{id:'legacy',title:'Keep me',date:'2026-11-16',desc:'',status:1}]},version:2})]]);
globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key),clear:()=>values.clear(),key:index=>[...values.keys()][index]??null,get length(){return values.size}};
const {useTasksStore}=await import('../src/state/tasks.ts');
test('version 2 task data migrates to the Personal workspace',()=>{
 const state=useTasksStore.getState();
 assert.deepEqual(state.tasks.map(t=>t.title),['Keep me']);
 assert.equal(state.activeWorkspaceId,'personal');
 assert.equal(state.workspaces.length,1);
});
