import 'tsconfig-paths/register';

import path from 'path';

import { DataSource } from 'typeorm';

const entitiePath = path.join(__dirname, '../../src/**/*.entity.{js,ts}');

export const testDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 13306,
  username: 'root',
  password: '1234',
  database: 'test_kitchen_manager',
  synchronize: true,
  entities: [entitiePath],
});

export const initializeTestDb = async () => {
  await testDataSource
    .initialize()
    .then(() => {
      console.log('TEST Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('Error during TEST Data Source initialization', err);
    });
};

export const clearTestDb = async () => {
  await testDataSource
    .dropDatabase()
    .then(() => {
      console.log('TEST Data Source has been dropped!');
    })
    .catch((err) => {
      console.error('Error during TEST Data Source drop', err);
    });

  await testDataSource
    .destroy()
    .then(() => {
      console.log('TEST Data Source has been disconnected!');
    })
    .catch((err) => {
      console.error('Error during TEST Data Source disconnection', err);
    });
};
