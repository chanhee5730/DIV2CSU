'use client';

import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LikeOutlined,
  ContainerOutlined,
  SendOutlined,
  MailOutlined,
  HomeOutlined,
  UnlockOutlined,
  UserOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { App, Button, Layout, Menu, MenuProps } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { currentSoldier } from './actions';
import _ from 'lodash';

const title = {
  '/points': '상점 관리',
  '/points/request': '상점 요청',
  '/points/give': '상점 부여',
  '/soldiers/list': '유저 관리',
  '/soldiers/signup': '회원가입 관리',
};

function renderTitle(pathname: string) {
  if (pathname in title) {
    return title[pathname as keyof typeof title];
  }
  return '병영생활 관리';
}

export function MenuLayout({
  data,
  children,
}: {
  data: Awaited<ReturnType<typeof currentSoldier>> | null;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const onClick: MenuClickEventHandler = useCallback(
    (info) => {
      router.replace(info.key);
      setCollapsed(true);
    },
    [router],
  );

  const items: MenuProps['items'] = useMemo(
    () =>
      data == null
        ? []
        : [
            {
              key: '/soldiers',
              label: data.name ?? '',
              icon: <UserOutlined />,
              onClick,
            },
            { key: '/', label: '홈', icon: <HomeOutlined />, onClick },
            {
              key: '/soldiers/#',
              label: '유저',
              icon: <UserOutlined />,
              children: [
                {
                  key: '/soldiers/list',
                  label: '유저 관리',
                  icon: <UserOutlined />,
                  disabled:
                    _.intersection(data.permissions, [
                      'Admin',
                      'UserAdmin',
                      'ListUser',
                    ]).length === 0,
                  onClick,
                },
                {
                  key: '/soldiers/signup',
                  label: '회원가입 관리',
                  icon: <UserAddOutlined />,
                  disabled:
                    _.intersection(data.permissions, [
                      'Admin',
                      'UserAdmin',
                      'ListUser',
                      'VerifyUser',
                    ]).length === 0,
                  onClick,
                },
              ],
            },
            {
              key: '/points/#',
              label: '상점',
              icon: <LikeOutlined />,
              children: [
                {
                  key: '/points',
                  label: '상점 관리',
                  icon: <ContainerOutlined />,
                  onClick,
                },
                {
                  key: '/points/request',
                  label: '상점 요청',
                  icon: <MailOutlined />,
                  disabled: data.type !== 'enlisted',
                  onClick,
                },
                {
                  key: '/points/give',
                  label: '상점 부여',
                  icon: <SendOutlined />,
                  onClick,
                  disabled:
                    _.intersection(data.permissions, [
                      'Admin',
                      'PointAdmin',
                      'GiveMeritPoint',
                      'GiveLargeMeritPoint',
                      'GiveDemeritPoint',
                      'GiveLargeDemeritPoint',
                    ]).length === 0,
                },
              ],
            },
            {
              key: '/auth/logout',
              label: '로그아웃',
              icon: <UnlockOutlined />,
              danger: true,
              onClick,
            },
          ],
    [data, onClick],
  );

  const onClickMenu = useCallback(() => setCollapsed((state) => !state), []);

  if (data == null || pathname.startsWith('/auth')) {
    return children;
  }

  return (
    <App>
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Sider
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 60,
            bottom: 0,
            zIndex: 1,
          }}
          collapsible
          collapsed={collapsed}
          collapsedWidth={0}
          trigger={null}
        >
          <Menu
            theme='dark'
            mode='inline'
            items={items}
            selectedKeys={[pathname]}
          />
        </Layout.Sider>
        <Layout>
          <Layout.Header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              display: 'flex',
              flexDirection: 'row',
              padding: 0,
              paddingLeft: 20,
              alignItems: 'center',
            }}
          >
            <Button
              type='text'
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={onClickMenu}
              style={{ color: '#FFF' }}
            />
            <p className='text-white font-bold text-xl ml-5'>
              {renderTitle(pathname)}
            </p>
          </Layout.Header>
          <Layout.Content>{children}</Layout.Content>
          <Layout.Footer style={{ textAlign: 'center' }}>
            <span className='text-black font-bold'>©2023 키보드워리어</span>
          </Layout.Footer>
        </Layout>
      </Layout>
    </App>
  );
}
