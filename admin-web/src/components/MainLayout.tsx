'use client';

import React from 'react';
import { Layout, theme } from 'antd';
import MenuList from './MenuList';

const { Header, Content, Sider } = Layout;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="demo-logo-vertical" />
        <MenuList />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '24px', background: colorBgContainer }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
