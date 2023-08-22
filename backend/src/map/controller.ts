import { RouteProtection, RouteProtectionJwtResult } from '@backend/security';
import { createController, createControllerMethod } from 'servaljs';
import type { FddMapEntry, FddMapEntryMeta } from '@bcms';
import { useBcms } from '@backend/bcms';
import type { ControllerItemsResponse } from '@backend/types';

export interface Test {
  a: FddMapEntry;
}

export const MapController = createController({
  path: '/api/v1/map',
  name: 'Map',
  methods() {
    const bcms = useBcms();

    return {
      getAll: createControllerMethod<
        RouteProtectionJwtResult,
        ControllerItemsResponse<FddMapEntryMeta>
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: RouteProtection.createJwtCheck(),
        async handler() {
          const items = (
            (await bcms.content.entry.find(
              'fdd_map',
              async () => true,
            )) as FddMapEntry[]
          ).map((e) => e.meta.en as FddMapEntryMeta);
          return {
            items,
            limit: items.length,
            total: items.length,
            offset: 0,
          };
        },
      }),
    };
  },
});
