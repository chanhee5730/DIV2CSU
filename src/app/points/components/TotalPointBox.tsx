'use client';
import { useLayoutEffect, useState } from 'react';
import { Card, Row, Skeleton, Statistic } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Soldier } from '@/interfaces';
import { fetchPointSummary } from '@/app/actions';

export function TotalPointBox({ user }: { user: Soldier }) {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchPointSummary>
  > | null>(null);

  useLayoutEffect(() => {
    fetchPointSummary(user.sn).then(setData);
  }, [user.sn]);

  return (
    <Row>
      <Card className='flex-1'>
        <Skeleton
          paragraph={{ rows: 1 }}
          active
          loading={data == null}
        >
          {data ? (
            <Statistic
              title='잔여 상점/총 상점'
              value={`${data.merit - data.usedMerit}/${data.merit}점`}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          ) : null}
        </Skeleton>
      </Card>
      <Card className='flex-1'>
        <Skeleton
          paragraph={{ rows: 1 }}
          active
          loading={data == null}
        >
          {data ? (
            <Statistic
              title='잔여 벌점/총 벌점'
              value={`${data.demerit - data.usedDemerit}/${data.demerit}점`}
              prefix={<CloseOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          ) : null}
        </Skeleton>
      </Card>
    </Row>
  );
}
