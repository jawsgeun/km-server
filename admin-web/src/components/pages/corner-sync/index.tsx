'use client';

import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import flatten from 'lodash/flatten';

import React, { useState } from 'react';
import {
  DatePicker,
  Button,
  Layout,
  Select,
  Table,
  InputNumber,
  Input,
  Form,
  Typography,
} from 'antd';
import { getCurrentYYYYMMDD } from '@/src/utils/date_util';
import { API_URL } from '@/src/utils/api_util';

const { RangePicker } = DatePicker;

interface MenuItem {
  id: string;
  name: string;
}

interface Menu {
  id: string;
  dateServed: string;
  bld: string;
  order: number;
  cornerName: string;
  menuItemList: MenuItem[];
}

interface OperationBranch {
  id: number;
  companyName: string;
  name: string;
}

interface Props {
  operationBranchList: OperationBranch[];
}

interface Item {
  key: string;
  menuId: string;
  dateServed: string;
  bld: string;
  order: number;
  cornerName: string;
  menuItemName: string;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const CornerSyncPage: React.FC<Props> = ({ operationBranchList }) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: Item) => record.key === editingKey;

  const edit = (record: Partial<Item> & { key: React.Key }) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const [menuList, setMenuList] = useState<Menu[]>([]);
  const [operationBranchId, setOperationBranchId] = useState<string | null>(
    null,
  );
  const [dateFrom, setDateFrom] = useState<string>(getCurrentYYYYMMDD());
  const [dateTo, setDateTo] = useState<string>(getCurrentYYYYMMDD());

  const menuItemList = flatten(
    menuList.map((menu) => {
      return menu.menuItemList.map((menuItem) => ({
        key: menuItem.id,
        menuId: menu.id,
        dateServed: menu.dateServed,
        bld: menu.bld,
        order: menu.order,
        cornerName: menu.cornerName,
        menuItemName: menuItem.name,
      }));
    }),
  );

  const onRangeChange = (dates: null | (Dayjs | null)[]) => {
    if (dates && dates[0] && dates[1]) {
      const dateFrom = dates[0].format('YYYYMMDD');
      const dateTo = dates[1].format('YYYYMMDD');
      setDateFrom(dateFrom);
      setDateTo(dateTo);
    }
  };

  const onSelectOperationBranchId = (operationBranchId: string) => {
    setOperationBranchId(operationBranchId);
  };

  const loadMenuList = async () => {
    if (!operationBranchId || !dateFrom || !dateTo) {
      alert('필터를 확인해주세요');
      return;
    }

    const res = await fetch(
      `${API_URL}/menu?dateFrom=${dateFrom}&dateTo=${dateTo}&operationBranchId=${operationBranchId}`,
    );

    const result = await res.json();

    if (result.error) {
      alert(`에러 발생${JSON.stringify(result)}`);
      return;
    }
    setMenuList(result.data);
  };

  const save = async (menuId: string) => {
    try {
      const row = (await form.validateFields()) as Item;

      const res = await fetch(`${API_URL}/menu/${menuId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: Number(row.order),
          cornerName: row.cornerName,
        }),
      });

      const result = await res.json();

      if (result.error) {
        alert(`에러 발생${JSON.stringify(result)}`);
      } else {
        alert(result.message);
        await loadMenuList();
        cancel();
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: '메뉴 ID',
      dataIndex: 'menuId',
      width: '10%',
      editable: false,
    },
    {
      title: '제공일자',
      dataIndex: 'dateServed',
      width: '10%',
      editable: false,
    },
    {
      title: '끼니',
      dataIndex: 'bld',
      width: '5%',
      editable: false,
    },
    {
      title: '순서',
      dataIndex: 'order',
      width: '10%',
      editable: true,
    },
    {
      title: '코너명',
      dataIndex: 'cornerName',
      width: '20%',
      editable: true,
    },
    {
      title: '음식명',
      dataIndex: 'menuItemName',
      width: '35%',
      editable: false,
    },
    {
      title: '동작',
      dataIndex: 'operation',
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.menuId)}
              style={{ marginRight: 8 }}
            >
              Save
            </Typography.Link>
            <Typography.Link onClick={cancel}>Cancel</Typography.Link>
          </span>
        ) : (
          <Typography.Link
            disabled={editingKey !== ''}
            onClick={() => edit(record)}
          >
            Edit
          </Typography.Link>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Layout>
      <div style={{ marginBottom: 16 }}>
        <RangePicker
          defaultValue={[dayjs(), dayjs()]}
          onChange={onRangeChange}
        />

        <Select
          options={operationBranchList.map((operationBranch) => ({
            label: `${operationBranch.name}-${operationBranch.companyName}`,
            value: String(operationBranch.id),
          }))}
          placeholder="기관 선택"
          style={{ width: 300 }}
          onChange={onSelectOperationBranchId}
        />
        <Button onClick={loadMenuList}>불러오기</Button>
      </div>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          rowClassName="editable-row"
          dataSource={menuItemList}
          columns={mergedColumns}
        />
      </Form>
    </Layout>
  );
};

export default CornerSyncPage;
