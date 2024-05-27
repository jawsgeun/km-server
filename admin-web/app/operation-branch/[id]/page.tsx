'use server';

import OperationBranchDetailPage from '@/src/components/pages/operation-branch/detail';
import { API_URL } from '@/src/utils/api_util';

const page = async ({ params }: { params: { id: string } }) => {
  const res = await fetch(`${API_URL}/operation-branch/${params.id}`, {
    cache: 'no-store',
  });
  const result = await res.json();

  return <OperationBranchDetailPage operationBranch={result} />;
};

export default page;
