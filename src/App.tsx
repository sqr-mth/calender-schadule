import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './components/Nav';

const App: React.FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default App;
