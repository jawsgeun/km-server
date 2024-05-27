'use client';

import React, { useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Layout, Table } from 'antd';
import Column from 'antd/es/table/Column';
import { API_URL } from '@/src/utils/api_util';
import { formatKSTString } from '@/src/utils/date_util';

interface OperationBranchManager {
  id: number;
  name: string;
  tel: string;
  telCountryCode: string;
  email: string;
  dateCreated: number;
  dateUpdated: number;
}

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
  managerList: OperationBranchManager[];
}

interface Props {
  operationBranch: OperationBranch;
}

interface FormField {
  name: string;
  tel: string;
  telCountryCode: string;
  email: string;
}

const OperationBranchDetailPage: React.FC<Props> = ({ operationBranch }) => {
  const [managerList, setManagerList] = useState(operationBranch.managerList);
  const [form] = Form.useForm();

  const reloadManagerList = async () => {
    const res = await fetch(
      `${API_URL}/operation-branch/${operationBranch.id}`,
      {
        cache: 'no-store',
      },
    );
    const result = (await res.json()) as OperationBranch;
    setManagerList(result.managerList);
  };

  const validateFormValue = (formValue: FormField) => {
    const { email, tel, telCountryCode } = formValue;
    if (!email && !tel && !telCountryCode) {
      return false;
    }
    if (Boolean(tel) !== Boolean(telCountryCode)) {
      return false;
    }
    return true;
  };

  const createOperationBranchManager = async (formValue: FormField) => {
    if (!validateFormValue(formValue)) {
      alert('입력을 다시 확인해주세요');
      return;
    }

    const res = await fetch(
      `${API_URL}/operation-branch/${operationBranch.id}/manager`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formValue.name,
          tel: formValue.tel ? String(formValue.tel) : null,
          telCountryCode: formValue.telCountryCode
            ? String(formValue.telCountryCode)
            : null,
          email: formValue.email || null,
        }),
      },
    );

    const result = await res.json();

    if (result.error) {
      alert(`에러 발생${JSON.stringify(result)}`);
    } else {
      alert(result.message);
      form.resetFields();
      await reloadManagerList();
    }
  };

  return (
    <Layout>
      <Card
        title={`${operationBranch.name}-${operationBranch.companyName}`}
        bordered={false}
        style={{ width: 300 }}
      >
        <p>{`ID: ${operationBranch.id}`}</p>
        <p>{`지점 코드: ${operationBranch.code}`}</p>
        <p>{`로그인 코드: ${operationBranch.loginCode}`}</p>
        <p>{`위도: ${operationBranch.latitude}`}</p>
        <p>{`경도: ${operationBranch.longitude}`}</p>
        <p>{`생성일자: ${formatKSTString(operationBranch.dateCreated)}`}</p>
        <p>{`수정일자: ${formatKSTString(operationBranch.dateUpdated)}`}</p>
      </Card>

      <Card title="매니저 목록">
        <Table dataSource={managerList} pagination={false}>
          <Column title="ID" dataIndex="id" key="id" />
          <Column title="이름" dataIndex="name" key="name" />
          <Column
            title="국가번호"
            dataIndex="telCountryCode"
            key="telCountryCode"
          />
          <Column title="전화번호" dataIndex="tel" key="tel" />
          <Column title="이메일" dataIndex="email" key="email" />
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
        <Form
          layout="inline"
          form={form}
          onFinish={createOperationBranchManager}
        >
          <Form.Item
            label="매니저명"
            name="name"
            rules={[{ required: true, message: 'Please input!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="국가번호" name="telCountryCode">
            <InputNumber style={{ minWidth: 100 }} controls={false} />
          </Form.Item>
          <Form.Item label="전화번호" name="tel">
            <InputNumber style={{ minWidth: 150 }} controls={false} />
          </Form.Item>
          <Form.Item
            label="이메일"
            name="email"
            rules={[{ type: 'email', message: '이메일 입력!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="default" htmlType="submit">
              등록
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  );
};

export default OperationBranchDetailPage;
