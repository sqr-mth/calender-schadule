"use client";

import React, { useEffect, useRef } from 'react';
import { Form, Input, Radio, type FormInstance } from 'antd';
import { Status, StatusKey, Task } from '@/state/tasks';
import './modals.css';

type CalenderFormProps = {
  form: FormInstance<Task>;
  onFormChange: (changedValues: Partial<Task>, allValues: Task) => void;
  initialValues?: Task;
};

const CalenderForm: React.FC<CalenderFormProps> = ({ form, onFormChange, initialValues }) => {
  const prevIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!initialValues) return;
    // Only reset the form when the task changes (new task or different task opened)
    if (prevIdRef.current === initialValues.id) return;
    prevIdRef.current = initialValues.id;

    form.resetFields();
    form.setFieldsValue({
      ...initialValues,
      status: initialValues.status
        ? (Number(initialValues.status) as StatusKey)
        : 1,
    });
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={(changed, all) => onFormChange(changed, all)}
    >
      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, whitespace: true, message: 'Please enter a title' }]}
      >
        <Input placeholder="e.g. Design review" maxLength={120} autoFocus />
      </Form.Item>

      <Form.Item label="Description" name="desc">
        <Input.TextArea rows={3} placeholder="Optional details..." />
      </Form.Item>

      <Form.Item
        label="Status"
        name="status"
        rules={[{ required: true, message: 'Please select a status' }]}
      >
        <Radio.Group>
          {(Object.entries(Status) as [string, string][]).map(([key, label]) => (
            <Radio value={Number(key)} key={key}>
              {label}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>
    </Form>
  );
};

export default CalenderForm;
