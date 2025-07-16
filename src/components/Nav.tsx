"use client";
import React, { useState, useEffect } from 'react';
import { Menu, MenuProps } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Nav: React.FC = () => {
  const pathname = usePathname();
  const [current, setCurrent] = useState('');
  
  // Update current tab based on pathname whenever pathname changes or on component mount
  useEffect(() => {
    // Map routes to tab keys
    const routeToTabMap: Record<string, string> = {
      '/': 'calendar', // Default for root path
      '/calender': 'calendar',
      '/tasks': 'tasks',
    };
    
    // Get the current tab key based on the pathname
    const tabKey = routeToTabMap[pathname] || pathname.replace('/', '');
    setCurrent(tabKey);
  }, [pathname]);
  
  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  return (
    <Menu mode="horizontal" selectedKeys={[current]} onClick={onClick}>
      <Menu.Item key="calendar">
        <Link href="/calender">Calendar</Link>
      </Menu.Item>
      <Menu.Item key="tasks">
        <Link href="/tasks">Tasks</Link>
      </Menu.Item>
    </Menu>
  );
};

export default Nav;
