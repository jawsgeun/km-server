'use server';

import MenuActualCoverCountPage from '@/src/components/pages/menu-actual-cover-count';
import { API_URL } from '@/src/utils/api_util';

const page = async () => {
  const res = await fetch(`${API_URL}/operation-branch`, { cache: 'no-store' });
  const result = await res.json();

  return <MenuActualCoverCountPage operationBranchList={result.data} />;
};

export default page;
