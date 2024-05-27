'use server';

import OperationBranchPage from '@/src/components/pages/operation-branch';
import { API_URL } from '@/src/utils/api_util';

const page = async () => {
  const res = await fetch(`${API_URL}/operation-branch`, { cache: 'no-store' });
  const result = await res.json();

  return <OperationBranchPage operationBranchList={result.data} />;
};

export default page;
