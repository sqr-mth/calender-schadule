
import CalenderComponent from '@/components/Calender/Calendar';
import React from 'react';
const CalendarPage: React.FC = () => {
  return (
    <div className='mx-4 mt-5 '>
      <h1 className='text-center bg-blue-600 text-white py-3 rounded-2xl mb-5'>Please select day and set tasks on day</h1>
      <CalenderComponent />
    </div>
  );
};

export default CalendarPage;