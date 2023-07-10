import type { AuthLoginBody, AuthLoginResult, AuthLogoutBody } from '@backend/auth';
import { Storage } from '@ui/storage';
import type { Api } from '../main';

export class AuthHandler {
  private readonly baseUrl = '/v1/auth';

  constructor(private api: Api) {}

  public async login(data: AuthLoginBody) {
    const result = await this.api.send<AuthLoginResult>({
      url: `${this.baseUrl}/login`,
      method: 'POST',
      doNotAuth: true,
      data,
    });
    await Storage.set('at', result.accessToken);
    await Storage.set('rt', result.refreshToken);
  }

  public async logout() {
    const data: AuthLogoutBody = {
      token: Storage.get('rt') || '',
    };
    await this.api.send<{
      ok: boolean;
    }>({
      url: `${this.baseUrl}/logout`,
      method: 'POST',
      doNotAuth: true,
      data,
    });
    await this.api.clearAndLogout();
  }
}
