'use server';

import EyeMeasurementPage from '@/src/components/pages/eye-measurement';
import { API_URL } from '@/src/utils/api_util';

const page = async () => {
  const res = await fetch(`${API_URL}/operation-branch`, { cache: 'no-store' });
  const result = await res.json();

  return <EyeMeasurementPage operationBranchList={result.data} />;
};

export default page;
