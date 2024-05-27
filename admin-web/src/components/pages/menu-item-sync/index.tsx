'use client';

import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import flatten from 'lodash/flatten';

import React, { useState } from 'react';
import { DatePicker, Button, Layout, Select, Table, Checkbox } from 'antd';
import { getCurrentYYYYMMDD } from '@/src/utils/date_util';
import { API_URL } from '@/src/utils/api_util';
import Column from 'antd/es/table/Column';

const { RangePicker } = DatePicker;

interface MenuItem {
  id: string;
  name: string;
  activated: boolean;
}

interface Menu {
  id: string;
  dateServed: string;
  bld: string;
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

const MenuItemSyncPage: React.FC<Props> = ({ operationBranchList }) => {
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
        cornerName: menu.cornerName,
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        activated: menuItem.activated,
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

  const checkMenuItemActivated = async (
    menuItemId: string,
    checked: boolean,
  ) => {
    console.log(menuItemId);
    console.log(checked);

    const res = await fetch(`${API_URL}/menu-item/${menuItemId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activated: checked,
      }),
    });

    const result = await res.json();

    if (result.error) {
      alert(`에러 발생${JSON.stringify(result)}`);
    } else {
      alert(result.message);
      await loadMenuList();
    }
  };

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
      <Table dataSource={menuItemList}>
        <Column title="메뉴 ID" dataIndex="menuId" key="menuId" />
        <Column title="제공일자" dataIndex="dateServed" key="dateServed" />
        <Column title="끼니" dataIndex="bld" key="bld" />
        <Column title="코너명" dataIndex="cornerName" key="cornerName" />
        <Column title="음식명" dataIndex="menuItemName" key="menuItemName" />
        <Column title="메뉴아이템 ID" dataIndex="menuItemId" key="menuItemId" />
        <Column<{ menuItemId: string }>
          title="활성화 여부"
          dataIndex="activated"
          key="activated"
          render={(value, record) => (
            <Checkbox
              checked={value}
              onChange={(e) =>
                checkMenuItemActivated(record.menuItemId, e.target.checked)
              }
            />
          )}
        />
      </Table>
    </Layout>
  );
};

export default MenuItemSyncPage;
