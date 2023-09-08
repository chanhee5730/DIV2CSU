'use client';

import { Button, Card, Popconfirm, Skeleton, message } from 'antd';
import { useCallback, useLayoutEffect, useState } from 'react';
import { deletePoint, fetchPoint } from '../actions';
import { FetchPointData } from '../interfaces';
import moment from 'moment';
import { ArrowRightOutlined, DeleteOutlined } from '@ant-design/icons';

export type PointCardProps = {
  pointId: string;
};

export function PointCard({ pointId }: PointCardProps) {
  const [point, setPoint] = useState<FetchPointData | null>(null);
  const [deleted, setDeleted] = useState(false);

  const onDelete = useCallback(() => {
    deletePoint(pointId)
      .then(() => {
        message.success('삭제하였습니다');
        setDeleted(true);
      })
      .catch((e) => {
        message.error('삭제에 실패하였습니다');
      });
  }, [pointId]);

  useLayoutEffect(() => {
    fetchPoint(pointId).then((data) => {
      setPoint(data);
    });
  }, [pointId]);

  const backgroundColor = (() => {
    if (point == null) {
      return undefined;
    }
    if (point.verified_at) {
      return '#A7C0FF';
    }
    if (point.rejected_at || point.rejected_reason) {
      return '#ED2939';
    }
    return '#D9D9D9';
  })();

  return (
    <Card
      className={deleted ? 'line-through' : ''}
      size='small'
      style={{ backgroundColor }}
      title={
        point != null ? (
          <div className='flex flex-row justify-between items-center'>
            <div className='flex flex-row align-middle'>
              <p>{point.giver}</p>
              <ArrowRightOutlined className='mx-2' />
              <p>{point.receiver}</p>
            </div>
            <p>{`${point?.value ?? 0}점`}</p>
          </div>
        ) : null
      }
    >
      <Skeleton
        active
        paragraph={{ rows: 0 }}
        loading={point == null}
      >
        <div className='flex flex-row'>
          <div className='flex-1'>
            {point?.rejected_reason && (
              <p>반려 사유: {point?.rejected_reason}</p>
            )}
            <p>
              {point?.given_at
                ? moment(point.given_at).local().format('YYYY년 MM월 DD일')
                : null}
            </p>
            <p>{point?.reason}</p>
          </div>
          {point?.rejected_at ||
          point?.verified_at ||
          point?.rejected_reason ||
          point?.used_id ? null : (
            <Popconfirm
              title='삭제하시겠습니까?'
              okText='삭제'
              cancelText='취소'
              onConfirm={onDelete}
            >
              <Button
                danger
                icon={<DeleteOutlined key='delete' />}
              />
            </Popconfirm>
          )}
        </div>
      </Skeleton>
    </Card>
  );
}
