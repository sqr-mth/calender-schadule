"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Modal, Badge, List, Spin, Button, Typography, Empty } from "antd";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import { useRecoilState } from "recoil";
import { tasksState, Task, Status } from "../../state/tasks";
import { useQuery } from "react-query";
import axios from "axios";
import "./style.css";
import RadioComponent from "../RadioGroup";
import CalenderForm from "./FormCalender";

const { Title, Text } = Typography;

const CalendarComponent: React.FC = () => {
  const [tasks, setTasks] = useRecoilState(tasksState);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState<Task | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [statusTask, setStatusTask] = useState<keyof typeof Status | undefined>(undefined);
  const [currentMonthTasks, setCurrentMonthTasks] = useState<number>(0);

  const { data: posts, error, isLoading } = useQuery("postsData", retrievePosts);

  const changedValues = (changedValues: Partial<Task>, allValues: Task) => {
    setFormData({
      ...selectedTask,
      ...allValues,
      date: selectedDate || selectedTask?.date || "",
    });
  };
  
  // Initialize form data with selected date when modal opens
  useEffect(() => {
    if (isModalVisible && selectedDate) {
      if (selectedTask) {
        // Editing existing task
        setFormData({
          ...selectedTask,
          date: selectedDate,
        });
      } else {
        // New task with selected date
        setFormData({
          id: String(new Date().getTime()),
          title: "",
          desc: "",
          date: selectedDate,
          status: 1, // Default to waiting status
        });
      }
    }
  }, [isModalVisible, selectedDate, selectedTask]);

useEffect(() => {
  if (posts) {
    setTasks((prevTasks) => {
      const taskIds = new Set(prevTasks.map((task) => task.id));
      const newTasks = [
        ...prevTasks,
        ...posts.filter((task: Task) => !taskIds.has(task.id)),
      ];
      return newTasks;
    });
  }
}, [posts, setTasks]);

// Calculate number of tasks for the current month
useEffect(() => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const firstDayStr = firstDay.toISOString().split('T')[0];
  const lastDayStr = lastDay.toISOString().split('T')[0];
  
  const count = tasks.filter(task => {
    return task.date >= firstDayStr && task.date <= lastDayStr;
  }).length;
  
  setCurrentMonthTasks(count);
}, [tasks]);


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
    const today = new Date().toISOString().split('T')[0];
    const isToday = date === today;
    const hasOverdue = tasksForDate.some(task => task.status === 2);
    const hasUrgent = tasksForDate.some(task => task.status === 1);
    const allCompleted = tasksForDate.length > 0 && tasksForDate.every(task => task.status === 3);
    
    // Get day of month and determine if it's a weekend
    const dayOfMonth = value.date();
    const isWeekend = value.day() === 0 || value.day() === 6; // 0 is Sunday, 6 is Saturday
    
    return (
      <div 
        className={`calendar-cell  ${isToday ? 'today-cell' : ''} ${hasOverdue ? 'has-overdue' : ''} ${hasUrgent ? 'has-urgent' : ''} ${allCompleted ? 'all-completed' : ''} ${isWeekend ? 'weekend-cell' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          const formattedDate = value.format("YYYY-MM-DD");
          setSelectedDate(formattedDate);
          setSelectedTask(undefined);
          setIsModalVisible(true);
        }}
      >
        {/* <div className="date-indicator">{dayOfMonth}</div> */}
        
        {tasksForDate.length ? (
          <div className="task-container">
            {tasksForDate.length > 0 && (
              <div className="task-count">
                <Badge 
                  count={tasksForDate.length} 
                  style={{ 
                    backgroundColor: hasOverdue ? '#ff4d4f' : hasUrgent ? '#faad14' : allCompleted ? '#52c41a' : '#1890ff',
                    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.8)'
                  }} 
                />
              </div>
            )}
            <List
              size="small"
              className="task-list"
              dataSource={tasksForDate.slice(0, 3)} // Limit to 3 tasks for better display
              renderItem={(item) => (
                <List.Item 
                  id={item.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(e, item);
                  }} 
                  className={`task-item status-${item.status}`}
                >
                  <Badge
                    status={
                      item.status === 3
                        ? "success"
                        : item.status === 1
                        ? "warning"
                        : "error"
                    }
                    text={<span className="task-title">{item.title}</span>}
                    className="task-badge"
                  />
                </List.Item>
              )}
            />
            {tasksForDate.length > 3 && (
              <div className="more-tasks">+{tasksForDate.length - 3} more</div>
            )}
          </div>
        ) : (
          <div className="empty-cell">
            <PlusOutlined className="add-task-icon" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <Title level={4}>
          <CalendarOutlined /> Interactive Calendar
        </Title>
        <div className="calendar-summary">
          <div className="stats-card">
            <Text type="secondary">Tasks This Month</Text>
            <Text strong>{currentMonthTasks}</Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setSelectedDate(today);
              setSelectedTask(undefined);
              // Reset form data first to clear any previous values
              setFormData({
                id: String(new Date().getTime()),
                title: "",
                desc: "", // Include required desc field
                date: today,
                status: 1 // Use valid status value (waiting)
              });
              setIsModalVisible(true);
            }}
          >
            Add Task
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text className="loading-text">Loading your calendar...</Text>
        </div>
      ) : error ? (
        <div className="error-container">
          <Text type="danger">Failed to load calendar data.</Text>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : (
        <Calendar
          className="custom-calendar"
          fullscreen={false}
          onSelect={onSelect}
          cellRender={dateCellRender}
        />
      )}
      
      <Modal
        title={selectedTask ? "Edit Task" : "Add Task"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        className="task-modal"
        destroyOnClose
      >
        {selectedDate ? (
          <CalenderForm 
            onFormChange={changedValues} 
            initialValues={selectedTask || { 
              id: String(new Date().getTime()),
              title: "",
              desc: "",
              date: selectedDate,
              status: 1
            }}
          />
        ) : (
          <Empty description="No date selected" />
        )}
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
