import React, { useState } from 'react';
import { Button, Form, Input, Radio } from 'antd';
import type { FormProps, FormInstance } from 'antd';
import { Status, Task } from '@/state/tasks';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

type CalenderFormProps = {
  onFormChange: (changedValues: Task, allValues: Task) => void;
};

const CalenderForm: React.FC<CalenderFormProps> = ({ onFormChange }) => {
  const [form] = Form.useForm();
  const [componentVariant, setComponentVariant] = useState<FormProps['variant']>('filled');

  const onFormVariantChange = (changedValues:Task, allValues: Task) => {
    // if (changedValues.variant) {
    //   setComponentVariant(changedValues.variant);
    // }
    onFormChange(changedValues, allValues); // Send data to parent
  };

  return (
    <Form
      {...formItemLayout}
      form={form}
      onValuesChange={onFormVariantChange}
      variant={componentVariant}
      style={{ maxWidth: 600 }}
      initialValues={{ variant: componentVariant }}
      className="text-left"
    >
      <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please input!' }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Description" name="desc" rules={[{ required: true, message: 'Please input!' }]}>
        <Input.TextArea />
      </Form.Item>

      <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please input!' }]}>
        <Radio.Group>
          {Object.entries(Status).map(([key, value]) => (
            <Radio value={key} key={key}>
              {value}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>
    </Form>
  );
};

export default CalenderForm;
