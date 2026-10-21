"use client";

import React, { useEffect, useState } from "react";
import { Form, Modal } from "antd";
import { StatusKey, Task } from "@/state/tasks";
import CalenderForm from "./FormCalender";
import { todayISO } from "./taskMeta";

type Props = {
  open: boolean;
  /** Date for a new task; ignored when editing. */
  date?: string | null;
  task?: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
};

const TaskFormModal: React.FC<Props> = ({ open, date, task, onClose, onSave }) => {
  const [form] = Form.useForm<Task>();
  const [formData, setFormData] = useState<Task | undefined>(undefined);

  const handleOk = async () => {
    if (!formData) return;
    try {
      await form.validateFields();
    } catch {
      return; // antd shows the field errors inline
    }
    onSave({ ...formData, title: formData.title.trim(), desc: (formData.desc ?? "").trim() });
  };

  useEffect(() => {
    if (!open) return;
    setFormData(
      task
        ? { ...task }
        : { id: String(Date.now()), title: "", desc: "", date: date ?? todayISO(), status: 1 as StatusKey },
    );
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      title={task ? "Edit task" : "Add task"}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      centered
      className="task-modal"
      destroyOnClose
      okText={task ? "Save" : "Add task"}
    >
      {formData && (
        <CalenderForm
          form={form}
          onFormChange={(_changed, all) => setFormData((prev) => ({ ...prev!, ...all }))}
          initialValues={formData}
        />
      )}
    </Modal>
  );
};

export default TaskFormModal;
