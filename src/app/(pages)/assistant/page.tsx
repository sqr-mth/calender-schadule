'use client';
import Link from 'next/link';
import { Alert, Card, Empty, Tag } from 'antd';
import { aiProvider, analyzeLocally } from '@/lib/assistant';
import { useTasksStore } from '@/state/tasks';
const defaults={start:'09:00',end:'17:00',breaks:[{start:'12:00',end:'13:00'}]};
export default function Assistant(){
 const {tasks,timeEntries,habits,workspaces,activeWorkspaceId}=useTasksStore();const hours=workspaces.find(w=>w.id===activeWorkspaceId)?.workingHours??defaults;
 let insights:ReturnType<typeof analyzeLocally>|null=null;let error='';try{insights=analyzeLocally({tasks,timeEntries,habits,now:new Date(),workingHours:hours})}catch(e){error=e instanceof Error?e.message:'Could not analyze workload'}
 return <div className="module-page"><div className="module-header"><div><span className="eyebrow">PRODUCTIVITY ASSISTANT</span><h1>Workspace insights</h1><p>Facts from your current local data.</p></div><Tag color={aiProvider.configured?'green':'default'}>{aiProvider.configured?'AI connected':'AI not connected'}</Tag></div><Alert type="info" showIcon message="AI chat and generated summaries are not configured" description="The app has a provider interface, but no server-side provider credentials or account connection. The insights below are calculated locally from your data."/>{error&&<Alert type="error" message={error} style={{marginTop:15}}/>}{insights&&<div className="module-grid" style={{marginTop:18}}><Card title="This week"><p>{insights.summary}</p></Card><Card title="Workload"><p>{insights.overloadedDays.length?`${insights.overloadedDays.length} overloaded days: ${insights.overloadedDays.join(', ')}`:'No overloaded days detected in the next week.'}</p><Link href="/smart-schedule">Review schedule suggestions →</Link></Card><Card title="Priority suggestions">{insights.recommendedTaskIds.length?insights.recommendedTaskIds.map(id=><p key={id}>{tasks.find(t=>t.id===id)?.title}</p>):<Empty description="No open tasks to prioritize"/>}</Card></div>}</div>
}
