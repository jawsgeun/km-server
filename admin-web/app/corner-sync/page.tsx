'use server';

import CornerSyncPage from '@/src/components/pages/corner-sync';
import { API_URL } from '@/src/utils/api_util';

const page = async () => {
  const res = await fetch(`${API_URL}/operation-branch`, { cache: 'no-store' });
  const result = await res.json();

  return <CornerSyncPage operationBranchList={result.data} />;
};

export default page;
