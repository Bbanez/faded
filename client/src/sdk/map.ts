import type { FadedMapsEntryMeta } from '@bcms/types';
import { SDK } from './main';

export class MapHandler {
  private readonly basePath = '/map';

  async getData(id: string): Promise<FadedMapsEntryMeta> {
    return await SDK.send({
      url: `${this.basePath}/${id}`,
      doNotAuth: true,
    });
  }
}
