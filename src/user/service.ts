import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';
import { responseCode } from '@faded/response-code';
import type { User } from './models';

export class UserService {
  static checkBlocked(user: User, errorHandler: HTTPError): void {
    if (user.permBlock) {
      throw errorHandler.occurred(HTTPStatus.FORBIDDEN, responseCode('u005'));
    }
    if (user.blockedTo > Date.now()) {
      const date = new Date(user.blockedTo);
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        responseCode('u006', {
          date: `${date.getFullYear()}/${
            date.getMonth() + 1
          }/${date.getDate()} ${date.getHours()}:${date.getMinutes()} UTC`,
        }),
      );
    }
  }
}
