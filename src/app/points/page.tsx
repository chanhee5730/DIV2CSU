import { Soldier } from '@/interfaces';
import { PlusOutlined } from '@ant-design/icons';
import { Divider, FloatButton } from 'antd';
import { currentSoldier, fetchSoldier, hasPermission, listPoints } from '../actions';
import {
  PointListPagination,
  PointRequestList,
  PointsHistoryList,
  TotalPointBox,
  UsedPointsHorizontalList,
} from './components';
import { redirect } from 'next/navigation';

async function EnlistedPage({ user, page }: { user: Soldier; page: number }) {
  const { data, count, usedPoints } = await listPoints(user?.sn, page);
  return (
    <div className='flex flex-1 flex-col'>
      <TotalPointBox user={user} />
      <div className='flex-1 mb-2'>
        <UsedPointsHorizontalList data={usedPoints} />
        <PointsHistoryList
          type={user.type}
          data={data}
        />
      </div>
      <PointListPagination
        sn={user.sn}
        total={count}
        page={page}
      />
      <FloatButton
        icon={<PlusOutlined />}
        href='/points/request'
      />
    </div>
  );
}

async function NcoPage({
  user,
  page,
  showRequest,
}: {
  user: Soldier;
  page: number;
  showRequest: boolean;
}) {
  const { data, count } = await listPoints(user?.sn, page);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-1 mb-2'>
        {showRequest && (
          <>
            <p className='font-bold px-2 py-2'> 상벌점 요청 </p>
            <PointRequestList />
            <Divider />
          </>
        )}
        <p className='font-bold px-2 pb-2'> 상벌점 부여 기록 </p>
        <PointsHistoryList
          type={user.type}
          data={data}
        />
      </div>
      <Divider />
      <PointListPagination
        sn={user.sn}
        total={count}
        page={page}
      />
      <FloatButton
        icon={<PlusOutlined />}
        href='/points/give'
      />
    </div>
  );
}

export default async function ManagePointsPage({
  searchParams,
}: {
  searchParams: { sn?: string; page?: string };
}) {
  const [user, profile] = await Promise.all([
    searchParams.sn ? fetchSoldier(searchParams.sn) : currentSoldier(),
    currentSoldier(),
  ]);
  const page = parseInt(searchParams?.page ?? '1', 10) || 1;

  if(searchParams.sn && !hasPermission(profile.permissions, ['Admin', 'Commander'])){
    redirect('/points')
  }
  if (user.type === 'enlisted') {
    return (
      <EnlistedPage
        user={user as any}
        page={page}
      />
    );
  }
  return (
    <NcoPage
      user={user as any}
      page={page}
      showRequest={profile.sn === user.sn}
    />
  );
}