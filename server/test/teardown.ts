import { clearTestDb } from './utils/db-connnection';

export default async function teardown() {
  await clearTestDb();
}
