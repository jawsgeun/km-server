'use client';

import { useRouter } from 'next/navigation';

import React from 'react';
import { Button, Layout, Table } from 'antd';
import Column from 'antd/es/table/Column';
import { formatKSTString } from '@/src/utils/date_util';

interface OperationBranch {
  id: number;
  companyName: string;
  name: string;
  code: string;
  loginCode: string;
  latitude: number;
  longitude: number;
  dateCreated: number;
  dateUpdated: number;
}

interface Props {
  operationBranchList: OperationBranch[];
}

const OperationBranchPage: React.FC<Props> = ({ operationBranchList }) => {
  const router = useRouter();

  const onClickOperationBranchRow = (record: { id: number }) => {
    return {
      onClick: () => {
        router.push(`/operation-branch/${record.id}`);
      },
    };
  };

  return (
    <Layout>
      <div style={{ marginBottom: 16 }}>
        <Button
          onClick={() => {
            router.push('operation-branch/register');
          }}
        >
          기관 등록
        </Button>
      </div>
      <Table dataSource={operationBranchList} onRow={onClickOperationBranchRow}>
        <Column title="ID" dataIndex="id" key="id" />
        <Column title="회사명" dataIndex="companyName" key="companyName" />
        <Column title="기관명" dataIndex="name" key="name" />
        <Column title="기관코드" dataIndex="code" key="code" />
        <Column title="로그인 코드" dataIndex="loginCode" key="loginCode" />
        <Column title="위도" dataIndex="latitude" key="latitude" />
        <Column title="경도" dataIndex="longitude" key="longitude" />
        <Column
          title="생성일자"
          dataIndex="dateCreated"
          key="dateCreated"
          render={(value) => formatKSTString(value)}
        />
        <Column
          title="수정일자"
          dataIndex="dateUpdated"
          key="dateUpdated"
          render={(value) => formatKSTString(value)}
        />
      </Table>
    </Layout>
  );
};

export default OperationBranchPage;
