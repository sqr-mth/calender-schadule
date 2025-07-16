"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Modal, Input, Badge, List, RadioChangeEvent } from "antd";
import { useRecoilState } from "recoil";
import { tasksState, Task, Status } from "../../state/tasks";
import { useQuery } from "react-query";
import axios from "axios";
import "./style.css";
import RadioComponent from "../RadioGroup";
import CalenderForm from "./FormCalender";

const CalendarComponent: React.FC = () => {
  const [tasks, setTasks] = useRecoilState(tasksState);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState<Task | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [statusTask, setStatusTask] = useState<keyof typeof Status | undefined>(undefined);

  const { data: posts, error, isLoading } = useQuery("postsData", retrievePosts);

  const changedValues = (changedValues: Partial<Task>, allValues: Task) => {
    setFormData({
      ...selectedTask,
      ...allValues,
      date: selectedDate || selectedTask?.date || "",
    });
  };

useEffect(() => {
  if (posts) {
    setTasks((prevTasks) => {
      const taskIds = new Set(prevTasks.map((task) => task.id));
      const newTasks = [
        ...prevTasks,
        ...posts.filter((task: Task) => taskIds.has(task.id)),
      ];
      return newTasks;
    });
  }
}, [posts, setTasks]);


  const onSelect = (date: any) => {
    const formattedDate = date.format("YYYY-MM-DD");
    setSelectedDate(formattedDate);
    // When clicking on the cell itself (not a task), always create a new task
    setSelectedTask(undefined); // Clear any selected task to ensure we're creating a new one
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (formData) {
      if (selectedTask) {
        // Edit existing task
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === selectedTask.id ? { ...formData, id: task.id } : task
          )
        );
      } else {
        // Add new task
        setTasks([...tasks, { ...formData, id: String(new Date().getTime()) }]);
      }
      setIsModalVisible(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedTask(undefined);
  };

  const onTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation(); // Prevent the cell's onSelect from being triggered
    setSelectedDate(task.date);
    setSelectedTask(task);
    setIsModalVisible(true);
  };

  const dateCellRender = (value: any) => {
    const date = value.format("YYYY-MM-DD");
    const tasksForDate = tasks.filter((task) => task.date === date);
    return tasksForDate.length ? (
      <div 
        onClick={(e) => {
          // This prevents the List container from interfering with calendar cell clicks
          // Clicking anywhere in this div but not on a task item will still trigger onSelect
          e.stopPropagation();
          const formattedDate = value.format("YYYY-MM-DD");
          setSelectedDate(formattedDate);
          setSelectedTask(undefined); // Ensure we're creating a new task
          setIsModalVisible(true);
        }}
      >
        <List
          size="small"
          dataSource={tasksForDate}
          renderItem={(item) => (
            <List.Item 
              id={item.id} 
              onClick={(e) => {
                e.stopPropagation(); // Prevent propagation to parent div
                onTaskClick(e, item);
              }} 
              style={{ cursor: 'pointer' }}
            >
              <Badge
                status={
                  item.status == 1
                    ? "warning"
                    : item.status == 2
                    ? "error"
                    : "success"
                }
                text={item.title}
                className="truncate ..."
              />
            </List.Item>
          )}
        />
      </div>
    ) : null;
  };

  return (
    <div>
      <Calendar
        className="[&>tr>td>div>ant-picker-cell-inner]:!w-full"
        fullscreen={false}
        onSelect={onSelect}
        cellRender={dateCellRender}
      />
      <Modal
        title={selectedTask ? "Edit Task" : "Add Task"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <CalenderForm onFormChange={changedValues} initialValues={selectedTask} />
      </Modal>
    </div>
  );
};

const retrievePosts = async () => {
  try {
    const response = await axios.get("/api");
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default CalendarComponent;
