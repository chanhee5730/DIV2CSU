import { Collapse, ConfigProvider, Empty } from 'antd';
import { PointCard } from './PointCard';
import { useMemo } from 'react';

export type PointsHistoryListProps = { type: 'enlisted' | 'nco'; data: { id: string, verified_at: Date | null }[] };

export async function PointsHistoryList({
  data,
  type,
}: PointsHistoryListProps) {
  if (data.length === 0) {
    return (
      <div className='py-5 my-5'>
        <Empty
          description={
            <p>
              {type === 'enlisted'
                ? '받은 상벌점이 없습니다'
                : '부여한 상벌점이 없습니다'}
            </p>
          }
        />
      </div>
    );
  }
  const unverified = data.filter((data) => data.verified_at === null)
  const verified   = data.filter((data) => data.verified_at !== null)

  const items = useMemo(() => {
    if (!data) return [];
    const enlistedItems = [];
  
    if (type === 'enlisted') {
      enlistedItems.push({
        key: 'unverified',
        label: `상벌점 요청 내역 (${unverified.length})`,
        children: unverified.map((d) => <PointCard key={d.id} pointId={d.id}/>),
      });
    }
  
    enlistedItems.push({
      key: 'verified',
      label: `상벌점 ${type === 'nco' ? '승인' : ''} 내역 (${verified.length})`,
      children: verified.map((d) => <PointCard key={d.id} pointId={d.id}/>),
    });
  
    return enlistedItems;
  }, [data, type, unverified, verified]);

  return (
    <div>
      {data && <ConfigProvider
        theme={{
          components: {
            Collapse: {
              headerBg: '#ffffff',
              contentPadding: '0px 0px',
              contentBg: 'rgba(0, 0, 0, 0)'
            },
          },
        }}
        >
        <Collapse items={items} defaultActiveKey={type === 'enlisted' ? ['unverified'] : ['verified']}/>
      </ConfigProvider>}
    </div>
  );
}
