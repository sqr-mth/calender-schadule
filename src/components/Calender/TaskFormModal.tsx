'use client';

import { useEffect, useState } from 'react';
import { Alert, Form, Modal, message } from 'antd';
import type { Task } from '@/state/tasks';
import CalenderForm from './FormCalender';
import { todayISO } from './taskMeta';
import { normalizeTaskInput } from '@/lib/taskInput';

type Props = {
  open: boolean;
  date?: string | null;
  task?: Task;
  onClose: () => void;
  onSave: (task: Task) => void | Promise<void>;
};

export default function TaskFormModal({ open, date, task, onClose, onSave }: Props) {
  const [form] = Form.useForm<Task>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    form.resetFields();
    form.setFieldsValue(task ?? {
      id: '', title: '', desc: '', date: date ?? todayISO(), status: 1, priority: 'medium',
    });
  }, [open, task, date, form]);

  const handleSave = async () => {
    let values: Task;
    try {
      values = await form.validateFields();
    } catch (cause) {
      if (cause && typeof cause === 'object' && 'errorFields' in cause) return;
      setError(cause instanceof Error ? cause.message : 'Could not validate the task.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const normalized = normalizeTaskInput(values, task);
      await onSave(normalized);
      message.success(task ? 'Task updated' : 'Task added');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={task ? 'Edit task' : 'Add task'}
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      centered
      className="task-modal"
      destroyOnClose
      okText={task ? 'Save' : 'Add task'}
      okButtonProps={{ loading: saving }}
      cancelButtonProps={{ disabled: saving }}
      closable={!saving}
      maskClosable={!saving}
    >
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
      <CalenderForm form={form} />
    </Modal>
  );
}
