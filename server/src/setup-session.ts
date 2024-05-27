import { INestApplication } from '@nestjs/common';
import mysqlSession from 'express-mysql-session';
import * as expressSession from 'express-session';

import { ApiConfigService } from './shared/services/api-config.service';

const MySQLStore = mysqlSession(expressSession);
const session = expressSession.default;

export function setupSession(app: INestApplication) {
  const apiConfigService = app.get(ApiConfigService);

  const sessionStore = new MySQLStore(apiConfigService.mysqlSessionStoreConfig);

  const secret = apiConfigService.sessionStoreSecret;
  if (!secret) {
    throw new Error('session secret env not set');
  }

  const isLocalCookie = apiConfigService.isLocal || apiConfigService.isDebug;

  app.use(
    session({
      cookie: {
        domain: isLocalCookie ? 'localhost' : 'nuvilab.com',
      },
      name: 'KM-SESS',
      store: sessionStore,
      secret,
      resave: true,
      saveUninitialized: false,
    }),
  );
}
