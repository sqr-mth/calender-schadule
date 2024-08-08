"use client";

import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Task, getTasksState } from '@/state/tasks';
import { List, Input } from 'antd';
import { useQuery } from 'react-query';
import axios from 'axios';

const retrievePosts = async () => {
  try {
    const response = await axios.get("/api");
    console.log('Data fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

const Tasks: React.FC = () => {
  const [tasksSort, setTasksSort] = useState<{ [date: string]: Task[] }>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const { data: posts, error, isLoading } = useQuery("postsData", retrievePosts);
  const recoilTasks = useRecoilValue(getTasksState);

  useEffect(() => {
    let combinedTasks: Task[] = [];
    
    if (Array.isArray(posts)) {
      combinedTasks = [...posts];
    }

    setTasks(combinedTasks);
  }, [posts]);

  useEffect(() => {
    let combinedTasks: Task[] = [];
    
    if (Array.isArray(recoilTasks)) {
      combinedTasks = [...tasks, ...recoilTasks];
    }
    
    setTasks(combinedTasks);
  }, [recoilTasks]);

  useEffect(() => {
    const groupByTasks = (arr: Task[]) => {
      return arr.reduce((acc: { [date: string]: Task[] }, item: Task) => {
        const { date, ...rest } = item;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push({ date, ...rest });
        return acc;
      }, {});
    };

    const filteredTasks = tasks.filter(task => 
      task?.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task?.date?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setTasksSort(groupByTasks(filteredTasks));
  }, [tasks, searchTerm]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="mx-auto">
      <Input 
        placeholder="Search tasks..." 
        value={searchTerm} 
        onChange={handleSearch} 
        className="mb-4"
      />
      {Object.keys(tasksSort).map((date) => (
        <div key={date} className="bg-blue-100 mb-4 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">{date}</h3>
          <List
            itemLayout="horizontal"
            dataSource={tasksSort[date]}
            renderItem={(item: Task) => (
              <List.Item className="border-b border-gray-200 py-2">
                <List.Item.Meta description={item.desc} />
              </List.Item>
            )}
          />
        </div>
      ))}
    </div>
  );
};

export default Tasks;
