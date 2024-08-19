"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Modal, Input, Badge, List, RadioChangeEvent } from "antd";
import { useRecoilState } from "recoil";
import { tasksState, Task, Status } from "../../state/tasks";
import { useQuery } from "react-query";
import axios from "axios";
import "./style.css";
import RadioComponent from "../RadioGroup";

const CalendarComponent: React.FC = () => {
  const [tasks, setTasks] = useRecoilState(tasksState);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [taskDescription, setTaskDescription] = useState("");
  const {
    data: posts,
    error,
    isLoading,
  } = useQuery("postsData", retrievePosts);
  const [statusTask, setStatusTask] = useState<keyof typeof Status | undefined>(
    1
  );

  const onChange = (e: RadioChangeEvent) => {
    console.log("radio checked", e.target.value);
    setStatusTask(e.target.value);
  };

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

  const onSelect = (date: any) => {
    setSelectedDate(date.format("YYYY-MM-DD"));
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (selectedDate) {
      const newTask: Task = {
        id: String(new Date().getTime()),
        date: selectedDate,
        desc: taskDescription,
        status: statusTask,
      };
      setTasks([...tasks, newTask]);
      setTaskDescription("");
      setIsModalVisible(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const dateCellRender = (value: any) => {
    const date = value.format("YYYY-MM-DD");
    const tasksForDate = tasks.filter((task) => task.date === date);

    return tasksForDate.length ? (
      <List
        size="small"
        dataSource={tasksForDate}
        renderItem={(item) => (
          <List.Item>
            <Badge
              status={
                item.status == 1
                  ? "warning"
                  : item.status == 2
                  ? "error"
                  : "success"
              }
              text={item.desc}
              className="truncate ..."
            />
          </List.Item>
        )}
      />
    ) : null;
  };

  const monthCellRender = (value: any) => {
    const month = value.format("YYYY-MM");
    const tasksForMonth = tasks.filter((task) => task.date.startsWith(month));

    return tasksForMonth.length ? (
      <div>
        <Badge status="success" text={`${tasksForMonth.length} tasks`} />
      </div>
    ) : null;
  };

  return (
    <div>
      <Calendar
        className="[&>tr>td>div>ant-picker-cell-inner]:!w-full"
        fullscreen={false}
        onSelect={onSelect}
        dateCellRender={dateCellRender}
        monthCellRender={monthCellRender}
      />
      <Modal
        title="Add Task"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Task description"
        />

        <RadioComponent
          OnChange={onChange}
          data={Status}
          valueSelected={statusTask}
        />
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
