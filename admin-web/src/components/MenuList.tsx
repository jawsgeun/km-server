import React from 'react';
import {
  UserOutlined,
  BankOutlined,
  FileSyncOutlined,
  FilterOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { type MenuProps } from 'antd';
import { Menu } from 'antd';

const MenuList = () => {
  return <Menu theme="dark" mode="inline" items={items} />;
};

const items: MenuProps['items'] = [
  {
    label: '잔식 목측',
    key: 'eye-measurement',
    icon: <UserOutlined />,
    onClick: () => {
      window.location.href = '/eye-measurement';
    },
  },
  {
    label: '운영 기관 관리',
    key: 'operation-branch',
    icon: <BankOutlined />,
    onClick: () => {
      window.location.href = '/operation-branch';
    },
  },
  {
    label: '코너 sync 관리',
    key: 'corner-sync',
    icon: <FileSyncOutlined />,
    onClick: () => {
      window.location.href = '/corner-sync';
    },
  },
  {
    label: '메뉴아이템 sync 관리',
    key: 'menu-item-sync',
    icon: <FilterOutlined />,
    onClick: () => {
      window.location.href = '/menu-item-sync';
    },
  },
  {
    label: '메뉴 실제 식수 관리',
    key: 'menu-actual-cover-count',
    icon: <TeamOutlined />,
    onClick: () => {
      window.location.href = '/menu-actual-cover-count';
    },
  },
];

export default MenuList;
