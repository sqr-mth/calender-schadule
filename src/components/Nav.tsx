"use client";

import React, { useState, useEffect } from 'react';
import { Menu, type MenuProps } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarOutlined, UnorderedListOutlined } from '@ant-design/icons';

const NAV_ITEMS: MenuProps['items'] = [
  {
    key: 'calendar',
    icon: <CalendarOutlined />,
    label: <Link href="/calender">Calendar</Link>,
  },
  {
    key: 'tasks',
    icon: <UnorderedListOutlined />,
    label: <Link href="/tasks">Tasks</Link>,
  },
];

const ROUTE_MAP: Record<string, string> = {
  '/': 'calendar',
  '/calender': 'calendar',
  '/tasks': 'tasks',
};

const Nav: React.FC = () => {
  const pathname = usePathname();
  const [current, setCurrent] = useState('calendar');

  useEffect(() => {
    setCurrent(ROUTE_MAP[pathname] ?? pathname.replace('/', ''));
  }, [pathname]);

  return (
    <header className="nav-header">
      <div className="nav-logo">
        <CalendarOutlined style={{ fontSize: 20, color: '#1890ff' }} />
        <span>Scheduler</span>
      </div>
      <Menu
        mode="horizontal"
        selectedKeys={[current]}
        items={NAV_ITEMS}
        style={{ flex: 1, minWidth: 0, borderBottom: 'none', background: 'transparent' }}
      />
    </header>
  );
};

export default Nav;
