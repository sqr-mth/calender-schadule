"use client";
import React, { useState } from 'react';
import { Menu, MenuProps } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Nav: React.FC = () => {
  const pathname = usePathname()
  const [current, setCurrent] = useState(pathname.replace('/',''));
  
  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  return (
    <Menu mode="horizontal" selectedKeys={[current]} onClick={onClick}>
      <Menu.Item key="calendar" >
        <Link href="/calender" >Calendar</Link>
      </Menu.Item>
      <Menu.Item key="tasks">
        <Link href={"/tasks"}>Tasks</Link>
      </Menu.Item>
    </Menu>
  );
};

export default Nav;
