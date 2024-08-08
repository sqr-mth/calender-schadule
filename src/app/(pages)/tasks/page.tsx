"use client";
import React from 'react';
import Tasks from '../../../components/Tasks';

const TasksPage: React.FC = () => {
  return (
    <div className='mx-4 mt-5 '>
      <h1 className='text-center bg-blue-600 text-white  py-3 rounded-2xl mb-5'>Tasks</h1>
      <Tasks />
    </div>
  );
};

export default TasksPage;
