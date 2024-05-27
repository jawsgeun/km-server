import { initializeTestDb } from './utils/db-connnection';

export default async function setup() {
  await initializeTestDb();
}
