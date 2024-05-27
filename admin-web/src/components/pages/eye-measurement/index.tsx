'use client';

import React, { useEffect, useState } from 'react';
import flatten from 'lodash/flatten';
import { Button, Layout, Radio, Table } from 'antd';
import { Form, Input } from 'antd';
import { Select } from 'antd';
import dayjs from 'dayjs';
import type { DatePickerProps } from 'antd';
import { DatePicker } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { getCurrentBLD, getCurrentYYYYMMDD } from '@/src/utils/date_util';
import { API_URL } from '@/src/utils/api_util';

interface RawFoodIngredient {
  id: number;
  name: string;
}

export interface RawMenuItem {
  id: number;
  name: string;
  bld: string;
  dateServed: number;
  rawFoodIngredientList: RawFoodIngredient[];
}

interface FoodIngredient {
  id: number;
  name: string;
  remainingFoodAmount: number;
  remainingPriceAmount: number;
}
export interface MenuItem {
  id: number;
  name: string;
  remainingFoodAmount: number;
  remainingPriceAmount: number;
  totalRemainingFoodAmount: number;
  totalRemainingPriceAmount: number;
  foodIngredientList: FoodIngredient[];
}

const { Column } = Table;

interface FormField {
  volume: number;
  rawMenuItemId: number;
  rawFoodIngredientId: number;
}

interface OperationBranch {
  id: number;
  companyName: string;
  name: string;
}

interface Props {
  operationBranchList: OperationBranch[];
}

const EyeMeasurementPage: React.FC<Props> = ({ operationBranchList }) => {
  const [operationBranchId, setOperationBranchId] = useState<string | null>(
    null,
  );
  const [bld, setBld] = useState(() => {
    return getCurrentBLD();
  });
  const [dateServed, setDateServed] = useState(getCurrentYYYYMMDD());
  const [menuItemList, setMenuItemList] = useState<MenuItem[]>([]);
  const [rawMenuItemList, setRawMenuItemList] = useState<RawMenuItem[]>([]);
  const [selectedRawMenuItemId, setSelectedRawMenuItemId] = useState<
    string | null
  >(null);
  const [selectedRawFoodIngredientId, setSelectedRawFoodIngredientId] =
    useState<string | null>(null);
  const [rawFoodIngredientOptionList, setRawFoodIngredientOptionList] =
    useState<DefaultOptionType[]>([]);
  const [form] = Form.useForm<FormField>();

  useEffect(() => {
    const selectedRawFoodIngredientList =
      rawMenuItemList.find(
        (rawMenu) => String(rawMenu.id) === selectedRawMenuItemId,
      )?.rawFoodIngredientList || [];

    const rawFoodIngredientOptionList = selectedRawFoodIngredientList.map(
      (rawFoodIngredient) => ({
        label: rawFoodIngredient.name,
        value: String(rawFoodIngredient.id),
      }),
    );
    setRawFoodIngredientOptionList(rawFoodIngredientOptionList);
  }, [selectedRawMenuItemId]);

  const onChangeDateServed: DatePickerProps['onChange'] = (date) => {
    if (date) {
      const dateServedYYYYMMDD = date?.format('YYYYMMDD');
      setDateServed(dateServedYYYYMMDD);
    }
  };

  const reloadRawMenuItemList = async () => {
    const reloadedRawMenuItemList = await fetch(
      `${API_URL}/raw-menu-item?dateServedYYYYMMDD=${dateServed}&bld=${bld}&operationBranchId=${operationBranchId}`,
      { cache: 'no-store' },
    );
    const rawMenuItemList = await reloadedRawMenuItemList.json();
    setRawMenuItemList(rawMenuItemList);
  };

  const reloadMenuItemList = async () => {
    const reloadedMenuItemList = await fetch(
      `${API_URL}/menu-item?dateServedYYYYMMDD=${dateServed}&bld=${bld}&operationBranchId=${operationBranchId}`,
      { cache: 'no-store' },
    );
    const menuItemList = await reloadedMenuItemList.json();
    setMenuItemList(menuItemList);
  };

  const onLoadPageData = async () => {
    form.resetFields();
    if (!operationBranchId) {
      alert('기관을 선택해주세요');
      return;
    }
    await Promise.all([reloadMenuItemList(), reloadRawMenuItemList()]);
  };

  const submitEyeMeasurement = async (value: FormField) => {
    if (
      !confirm(`목측을 완료하시겠습니까?
볼륨값: ${value.volume}`)
    ) {
      return;
    }
    const res = await fetch('eye-measurement/api/eye-measurement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    });

    const result = await res.json();
    if (result.error) {
      alert(`에러 발생${JSON.stringify(result)}`);
    } else {
      alert(result.message);
    }
    await onLoadPageData();
  };

  const onSelectRawMenuItemId = (rawMenuId: string) => {
    setSelectedRawMenuItemId(rawMenuId);
    form.setFieldValue('rawFoodIngredientId', null);
  };

  const tableSourceList = flatten(
    menuItemList.map((item) => {
      const foodIngredientSource = item.foodIngredientList.map(
        (foodIngredient) => {
          return {
            id: foodIngredient.id,
            name: `${item.name}->${foodIngredient.name}`,
            remainingFoodAmount: foodIngredient.remainingFoodAmount,
            remainingPriceAmount: foodIngredient.remainingPriceAmount,
            totalRemainingFoodAmount: 0,
            totalRemainingPriceAmount: 0,
          };
        },
      );
      const menuItemSource = {
        id: item.id,
        name: item.name,
        remainingFoodAmount: item.remainingFoodAmount,
        remainingPriceAmount: item.remainingPriceAmount,
        totalRemainingFoodAmount: item.totalRemainingFoodAmount,
        totalRemainingPriceAmount: item.totalRemainingPriceAmount,
      };
      return [menuItemSource, ...foodIngredientSource];
    }),
  );

  const onSelectOperationBranchId = (operationBranchId: string) => {
    setOperationBranchId(operationBranchId);
  };

  return (
    <Layout>
      <div>
        <DatePicker
          defaultValue={dayjs()}
          onChange={onChangeDateServed}
          style={{ marginBottom: 30 }}
        />
        <Radio.Group
          name="bld-radio-group"
          onChange={({ target }) => setBld(target.value)}
          defaultValue={bld}
        >
          <Radio value="B">B</Radio>
          <Radio value="L">L</Radio>
          <Radio value="D">D</Radio>
        </Radio.Group>
        <Select
          options={operationBranchList.map((operationBranch) => ({
            label: `${operationBranch.name}-${operationBranch.companyName}`,
            value: String(operationBranch.id),
          }))}
          placeholder="기관 선택"
          style={{ width: 300 }}
          onChange={onSelectOperationBranchId}
        />
        <Button onClick={onLoadPageData}>불러오기</Button>
      </div>
      <Table dataSource={tableSourceList}>
        <Column title="ID" dataIndex="id" key="id" />
        <Column title="메뉴아이템 명" dataIndex="name" key="name" />
        <Column
          title="잔식량(g)"
          dataIndex="remainingFoodAmount"
          key="remainingFoodAmount"
        />
        <Column
          title="잔식금액"
          dataIndex="remainingPriceAmount"
          key="remainingPriceAmount"
        />
        <Column
          title="잔식량 summary"
          dataIndex="totalRemainingFoodAmount"
          key="totalRemainingFoodAmount"
        />
        <Column
          title="잔식금액 summary"
          dataIndex="totalRemainingPriceAmount"
          key="totalRemainingPriceAmount"
        />
      </Table>
      <Form layout="inline" form={form} onFinish={submitEyeMeasurement}>
        <Form.Item<FormField> name="rawMenuItemId" required>
          <Select
            options={rawMenuItemList.map((rawMenu) => ({
              label: rawMenu.name,
              value: String(rawMenu.id),
            }))}
            style={{ width: 300 }}
            placeholder="메뉴 아이템"
            onChange={onSelectRawMenuItemId}
          />
        </Form.Item>
        <Form.Item<FormField> name="rawFoodIngredientId">
          <Select
            options={rawFoodIngredientOptionList}
            style={{ width: 400 }}
            placeholder="식재료"
            onChange={(value) => setSelectedRawFoodIngredientId(value)}
          />
        </Form.Item>
        <Form.Item<FormField> name="volume" required>
          <Input placeholder="부피값 입력" />
        </Form.Item>
        <Form.Item>
          <Button type="default" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
};

export default EyeMeasurementPage;
