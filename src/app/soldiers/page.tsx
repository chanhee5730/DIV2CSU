'use client';

import { Permission, Soldier } from '@/interfaces';
import { LoadingOutlined, QuestionOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  FloatButton,
  Input,
  Popconfirm,
  Radio,
  Select,
  Spin,
  message,
} from 'antd';
import _ from 'lodash';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  currentSoldier,
  deleteSoldier,
  fetchSoldier,
  hasPermission,
  resetPasswordForce,
  updatePermissions,
} from '../actions';
import {
  HelpModal,
  PasswordForm,
  PasswordModal,
  PermissionsTransfer,
} from './components';
import { useRouter } from 'next/navigation';

export default function MyProfilePage({
  searchParams: { sn },
}: {
  searchParams: { sn: string };
}) {
  const [mySoldier, setMySoldier] = useState<Omit<Soldier, 'password'> | null>(
    null,
  );
  const [targetSoldier, setTargetSoldier] = useState<Omit<
    Soldier,
    'password'
  > | null>(null);
  const data = targetSoldier ?? mySoldier;
  const isViewingMine =
    targetSoldier == null || mySoldier?.sn === targetSoldier.sn;
  const [helpShown, setHelpShwon] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const router = useRouter();

  useLayoutEffect(() => {
    Promise.all([currentSoldier(), sn ? fetchSoldier(sn) : null]).then(
      ([newMySoldier, newTargetSoldier]) => {
        setMySoldier(newMySoldier as any);
        setPermissions(
          newTargetSoldier?.permissions ?? newMySoldier.permissions,
        );
        setTargetSoldier(newTargetSoldier as any);
      },
    );
  }, [sn]);

  const handleUpdatePermissions = useCallback(() => {
    updatePermissions({ sn, permissions }).then(({ message: newMessage }) => {
      if (newMessage != null) {
        message.error(newMessage);
      } else {
        setTargetSoldier(
          (state) =>
            ({
              ...state,
              permissions: permissions,
            } as any),
        );
        message.success('권한을 성공적으로 변경하였습니다');
      }
    });
  }, [sn, permissions]);

  const permissionAlertMessage = useMemo(() => {
    if (isViewingMine) {
      return '본인 권한은 수정할 수 없습니다';
    }
    if (!hasPermission(mySoldier!.permissions, ['Admin', 'Commander', 'UserAdmin'])) {
      return '권한 변경 권한이 없습니다';
    }
    return null;
  }, [isViewingMine, mySoldier?.permissions]);

  const handleResetPassword = useCallback(() => {
    if (isViewingMine) {
      return;
    }
    resetPasswordForce(sn).then(({ password, message: newMessage }) => {
      if (newMessage) {
        return message.error(newMessage);
      }
      setNewPassword(password);
    });
  }, [sn, isViewingMine]);

  const handleUserDelete = useCallback(() => {
    deleteSoldier({ sn, value: data?.deleted_at == null }).then(
      ({ message: newMessage }) => {
        if (newMessage) {
          message.error(newMessage);
        }
        setTargetSoldier((state) => {
          if (state == null) {
            return null;
          }
          message.success(
            `유저를 ${state.deleted_at == null ? '삭제' : '복원'}하였습니다`,
          );
          return {
            ...state,
            deleted_at: state.deleted_at == null ? new Date() : null,
          };
        });
      },
    );
  }, [sn, data?.deleted_at]);

  if (data == null) {
    return (
      <div className='flex flex-1 min-h-full justify-center items-center'>
        <Spin indicator={<LoadingOutlined spin />} />
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col py-2 px-3'>
      <div className='flex flex-row items-center'>
        <div className='flex flex-col'>
          <span>유형</span>
          <Select
            disabled
            value={data?.type}
          >
            <Select.Option value='enlisted'>용사</Select.Option>
            <Select.Option value='nco'>간부</Select.Option>
          </Select>
        </div>
        <div className='mx-2' />
        <div>
          <span>군번</span>
          <Input
            value={data?.sn}
            disabled
          />
        </div>
        <div className='mx-3' />
        <div>
          <span>이름</span>
          <Input
            value={data?.name}
            disabled
          />
        </div>
      </div>
      {(!isViewingMine && hasPermission(mySoldier!?.permissions, ['Admin', 'Commander'])) ? (
        <div className='my-3'>
          <Button href={`/points?sn=${targetSoldier.sn}`}>
            상점 내역 보기
          </Button>
        </div>
      ): null}
      {(!isViewingMine && hasPermission(mySoldier!?.permissions, ['Admin', 'Commander'])) ? (
        <div className='my-3'>
          <Button href={`/overtimes?sn=${targetSoldier.sn}`}>
            초과근무 내역 보기
          </Button>
        </div>
      ): null}
      {isViewingMine ? <PasswordForm sn={sn} force={false}/> : null}
      <div className='my-1' />
      {data?.type !== 'enlisted' && (
        <>
          <PermissionsTransfer
            currentUserPermissions={mySoldier?.permissions!}
            permissions={permissions as Permission[]}
            onChange={(t) => setPermissions(t)}
          />
          {permissionAlertMessage && (
            <>
              <div className='my-1' />
              <Alert
                type='warning'
                message={permissionAlertMessage}
              />
            </>
          )}
        </>
      )}
      <div className='flex flex-row mt-5 justify-start'>
        {!isViewingMine && (
          <>
            <Popconfirm
              title='초기화'
              description='정말 초기화하시겠습니까?'
              cancelText='취소'
              okText='초기화'
              okType='danger'
              onConfirm={handleResetPassword}
            >
              <Button danger>비밀번호 초기화</Button>
            </Popconfirm>
            <div className='mx-2' />
          </>
        )}
        {!isViewingMine && (
          <>
            <Popconfirm
              title={`${
                data?.deleted_at == null ? '삭제' : '복원'
              }하시겠습니까?`}
              cancelText='취소'
              okText={data?.deleted_at == null ? '삭제' : '복원'}
              okType='danger'
              onConfirm={handleUserDelete}
            >
              <Button danger>
                {data?.deleted_at == null ? '삭제' : '복원'}
              </Button>
            </Popconfirm>
            <div className='mx-2' />
          </>
        )}
        {data?.type === 'nco' && (
          <Button
            type='primary'
            disabled={
              isViewingMine || _.isEqual(targetSoldier.permissions, permissions)
            }
            onClick={handleUpdatePermissions}
          >
            저장
          </Button>
        )}
      </div>
      <FloatButton
        icon={<QuestionOutlined />}
        onClick={() => setHelpShwon(true)}
      />
      <HelpModal
        shown={helpShown}
        onPressClose={() => setHelpShwon(false)}
      />
      <PasswordModal
        password={newPassword}
        onClose={() => setNewPassword(null)}
      />
    </div>
  );
}