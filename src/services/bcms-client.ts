import { createBcmsClient } from '@becomes/cms-client';
import type { BCMSEntryParsed } from '@becomes/cms-client/types';
import { BCMSImageConfig } from '@becomes/cms-most/frontend';
import { Config } from '../game/config';

BCMSImageConfig.cmsOrigin = Config.cmsOrigin;
BCMSImageConfig.publicApiKeyId = Config.cmsApiKeyId;

export interface BCMSMetaPlus {
  _id: string;
  createdAt: number;
  updatedAt: number;
}

export const bcmsClient = createBcmsClient({
  cmsOrigin: Config.cmsOrigin,
  key: {
    id: Config.cmsApiKeyId,
    secret: Config.cmsApiKeySecret,
  },
  enableCache: true,
});

export class BCMS {
  static async getEntry<Entry extends BCMSEntryParsed = BCMSEntryParsed>(data: {
    template: string;
    entry: string;
    lng?: string | undefined;
    maxDepth?: number | undefined;
    skipCache?: boolean | undefined;
    skipStatusCheck?: boolean | undefined;
  }): Promise<Entry | null> {
    try {
      const result = (await bcmsClient.entry.get(data)) as Entry;
      return result;
    } catch (error) {
      return null;
    }
  }

  static async getEntryMeta<Meta = unknown>(data: {
    template: string;
    entry: string;
    lng?: string | undefined;
    maxDepth?: number | undefined;
    skipCache?: boolean | undefined;
    skipStatusCheck?: boolean | undefined;
  }): Promise<(Meta & BCMSMetaPlus) | null> {
    const result = await BCMS.getEntry(data);
    return result
      ? {
          ...(result.meta.en as Meta),
          _id: result._id,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        }
      : null;
  }
}
