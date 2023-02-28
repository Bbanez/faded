import {
  createController,
  createControllerMethod,
  createMiddleware,
  createPurpleCheetah,
} from '@becomes/purple-cheetah';
import type { Request, Response } from 'express';
import { MJML } from './mjml';

createPurpleCheetah({
  port: 3000,
  controllers: [
    createController({
      name: 'List controller',
      path: '/',
      methods() {
        return {
          list: createControllerMethod<unknown, string>({
            type: 'get',
            async handler({ response }) {
              const keys = Object.keys(MJML);
              response.setHeader('Content-Type', 'text/html');
              return `
              <ul>
              ${keys
                .map((key) => {
                  return `<li><a href="/${key}">${key}</a></li>`;
                })
                .join('')}
              </ul>`;
            },
          }),
        };
      },
    }),
  ],
  middleware: [
    createMiddleware({
      path: '/:email',
      name: 'Dev email preview',
      handler() {
        return async (req: Request, res: Response) => {
          const emailType = req.params.email as string;
          let html = `<h1>Template "${emailType}" does not exist.</h1>`;
          try {
            switch (emailType) {
              case 'forgotPassword':
                {
                  html = MJML.forgotPassword({
                    firstName: 'Test',
                    lastName: 'User',
                    query: 'asdf',
                  });
                }
                break;
              case 'verifyAccount':
                {
                  html = MJML.verifyAccount({
                    firstName: 'Test',
                    lastName: 'User',
                    query: 'asdf',
                  });
                }
                break;
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
          }
          res.setHeader('Content-Type', 'text/html');
          res.send(html);
        };
      },
    }),
  ],
});
