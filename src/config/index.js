import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production' || !process.env.NODE_ENV) {
  dotenv.config();
} else {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
}

export default {
  app: {
    title: 'Simple API',
    description: 'Node.js API',
  },
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  domain: process.env.DOMAIN,
  csrf: {
    csrf: false,
    csp: false,
    xframe: 'SAMEORIGIN',
    p3p: 'ABCDEF',
    xssProtection: true,
  },
  JWTSecret: process.env.JWTSECRET || 'Nermin2020',
  illegalUsernames: [
    'meanjs',
    'administrator',
    'password',
    'admin',
    'user',
    'unknown',
    'anonymous',
    'null',
    'undefined',
    'api',
  ],
}
;