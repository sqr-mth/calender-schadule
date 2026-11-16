'use client';

import { Form, Input, InputNumber, Radio, Select, type FormInstance } from 'antd';
import { Status, type Task, useTasksStore } from '@/state/tasks';
import './modals.css';

export default function CalenderForm({ form }: { form: FormInstance<Task> }) {
  // Select the stable store value. Filtering inside the selector creates a new
  // snapshot on every read and can cause a render loop in Zustand 5.
  const projects = useTasksStore(state => state.projects);
  const projectOptions = projects.filter(project => !project.archived).map(project => ({
    label: project.title, value: project.id,
  }));

  return (
    <Form form={form} layout="vertical">
      <Form.Item label="Title" name="title" rules={[{ required: true, whitespace: true, message: 'Please enter a title' }]}>
        <Input placeholder="e.g. Design review" maxLength={120} autoFocus />
      </Form.Item>
      <div className="task-form-grid">
        <Form.Item label="Due date" name="date" rules={[{ required: true, message: 'Choose a date' }]}>
          <Input type="date" />
        </Form.Item>
        <Form.Item label="Priority" name="priority">
          <Select options={['low', 'medium', 'high', 'urgent'].map(value => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} />
        </Form.Item>
        <Form.Item label="Project" name="projectId"><Select allowClear placeholder="No project" options={projectOptions} /></Form.Item>
        <Form.Item label="Start time" name="startTime"><Input type="time" /></Form.Item>
        <Form.Item label="Estimated minutes" name="estimatedMinutes"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
      </div>
      <Form.Item label="Description" name="desc" rules={[{ max: 4000, message: 'Description must be 4,000 characters or less' }]}>
        <Input.TextArea rows={3} maxLength={4000} showCount placeholder="Optional details..." />
      </Form.Item>
      <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select a status' }]}>
        <Radio.Group>
          {(Object.entries(Status) as [string, string][]).map(([key, label]) => (
            <Radio value={Number(key)} key={key}>{label}</Radio>
          ))}
        </Radio.Group>
      </Form.Item>
    </Form>
  );
}
