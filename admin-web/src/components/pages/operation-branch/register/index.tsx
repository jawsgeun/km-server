'use client';

import { useRouter } from 'next/navigation';

import React from 'react';
import { Button, Form, Input, InputNumber, Layout, Select } from 'antd';
import { OperationBranchCompanyName } from '@/src/constants';

interface FormField {
  companyName: string;
  name: string;
  code: string;
  loginCode: number;
  latitude: number;
  longitude: number;
}

import { API_URL } from '@/src/utils/api_util';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const OperationBranchRegisterPage: React.FC = () => {
  const router = useRouter();

  const createOperationBranch = async (formValue: FormField) => {
    const res = await fetch(`${API_URL}/operation-branch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName: formValue.companyName,
        name: formValue.name,
        code: formValue.code,
        loginCode: String(formValue.loginCode),
        latitude: formValue.latitude,
        longitude: formValue.longitude,
      }),
    });

    const result = await res.json();

    if (result.error) {
      alert(`에러 발생${JSON.stringify(result)}`);
    } else {
      alert(result.message);
      router.push('/operation-branch');
    }
  };
  return (
    <Layout>
      <Form
        {...formItemLayout}
        style={{ maxWidth: 600 }}
        onFinish={createOperationBranch}
      >
        <Form.Item
          label="회사명"
          name="companyName"
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Select
            options={[
              {
                label: OperationBranchCompanyName.ARAMARK,
                value: OperationBranchCompanyName.ARAMARK,
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="기관명"
          name="name"
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="기관코드"
          name="code"
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="로그인코드"
          name="loginCode"
          rules={[
            { required: true, message: 'Please input!' },
            { pattern: /^\d{6}$/, message: '6개 숫자로 입력' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} controls={false} />
        </Form.Item>

        <Form.Item
          label="위도"
          name="latitude"
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <InputNumber style={{ width: '100%' }} controls={false} />
        </Form.Item>

        <Form.Item
          label="경도"
          name="longitude"
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <InputNumber style={{ width: '100%' }} controls={false} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
    </Layout>
  );
};

export default OperationBranchRegisterPage;
