"use client";
import React from 'react';
import Tasks from '../../../components/Tasks';

const TasksPage: React.FC = () => {
  return (
    <div className='mx-4 mt-5 text-left'>
      <div className='bg-white h-max shadow-lg rounded-lg'>
        <h1 className='text-center  text-blue-600  py-3 rounded-2xl mb-5'>Tasks</h1>
      </div>
      <div className='bg-white h-max shadow-lg rounded-lg p-4 mb-3'>
<Tasks />

      </div>
      
    </div>
  );
};

export default TasksPage;
