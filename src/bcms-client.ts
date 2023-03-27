import type { BCMSEntryParsed } from '@becomes/cms-client/types';
import { useBcms } from './bcms';

export interface BCMSMetaPlus {
  _id: string;
  createdAt: number;
  updatedAt: number;
}

export class BCMSClient {
  static async getEntry<Entry extends BCMSEntryParsed = BCMSEntryParsed>(data: {
    template: string;
    entry: string;
    lng?: string | undefined;
    maxDepth?: number | undefined;
    skipCache?: boolean | undefined;
    skipStatusCheck?: boolean | undefined;
  }): Promise<Entry | null> {
    const bcmsClient = useBcms().client;
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
    const result = await BCMSClient.getEntry(data);
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
