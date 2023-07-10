import { createMiddleware } from 'servaljs';

export const IPMiddleware = createMiddleware({
  name: 'IP Middleware',
  path: '/',
  handler({ logger }) {
    return async (req, replay, next) => {
      replay.setHeader('X-Content-Type-Options', 'nosniff');
      if (req.headers['cf-connecting-ip']) {
        req.headers.rip = req.headers['cf-connecting-ip'];
      } else if (req.headers['x-forwarded-for']) {
        req.headers.rip= req.headers['x-forwarded-for'] as string;
      } else {
        req.headers.rip = '__unknown';
      }
      let userId = '';
      if (req.headers.authorization) {
        const parts = req.headers.authorization
          .replace('Bearer ', '')
          .split('.');
        if (parts[1]) {
          try {
            const payload = JSON.parse(
              Buffer.from(parts[1], 'base64').toString(),
            );
            userId = payload.userId;
          } catch (error) {
            // Do nothing
          }
        }
      }
      logger.info(
        '',
        `(${req.headers.rip}>${userId}) ${
          req.method
        }: ${req.url}`,
      );
      next();
    };
  },
});
