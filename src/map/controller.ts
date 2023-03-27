import type { FadedMapsEntry, FadedMapsEntryMeta } from '@bcms/types';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import { useBcms } from '@faded/bcms';

export const MapController = createController({
  name: 'Map',
  path: '/api/map',
  methods() {
    const bcms = useBcms();

    return {
      mapData: createControllerMethod<unknown, FadedMapsEntryMeta>({
        path: '/:id',
        type: 'get',
        async handler({ request, errorHandler }) {
          const entry = (await bcms.content.entry.findOne(
            'faded_maps',
            async (e) => e.meta.en.slug === request.params.id,
          )) as FadedMapsEntry;
          if (!entry) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Map with ID "${request.params.id}" does not exist.`,
            );
          }
          return entry.meta.en as FadedMapsEntryMeta;
        },
      }),
    };
  },
});
