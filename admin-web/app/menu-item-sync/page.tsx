'use server';

import MenuItemSyncPage from '@/src/components/pages/menu-item-sync';
import { API_URL } from '@/src/utils/api_util';

const page = async () => {
  const res = await fetch(`${API_URL}/operation-branch`, { cache: 'no-store' });
  const result = await res.json();

  return <MenuItemSyncPage operationBranchList={result.data} />;
};

export default page;
