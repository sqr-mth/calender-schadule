"use client";

import React, { useEffect } from 'react';
import { Form, Input, Radio } from 'antd';
import { Status, StatusKey, Task } from '@/state/tasks';

type CalenderFormProps = {
  onFormChange: (changedValues: Partial<Task>, allValues: Task) => void;
  initialValues?: Task;
};

const CalenderForm: React.FC<CalenderFormProps> = ({ onFormChange, initialValues }) => {
  const [form] = Form.useForm<Task>();

  useEffect(() => {
    form.resetFields();
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        // Normalise legacy string status values from API
        status: initialValues.status
          ? (Number(initialValues.status) as StatusKey)
          : 1,
      });
    }
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
        rules={[{ required: true, message: 'Please enter a title' }]}
      >
        <Input placeholder="Task title" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="desc"
        rules={[{ required: true, message: 'Please enter a description' }]}
      >
        <Input.TextArea rows={3} placeholder="Task description" />
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
