import * as path from 'path';
import * as nodeFs from 'fs';
import { useBcms } from '@backend/bcms';
import { createController, createControllerMethod, HttpStatus } from 'servaljs';

export const AssetController = createController({
  name: 'Asset',
  path: '/api/v1/asset',
  methods() {
    const bcms = useBcms();

    return {
      get: createControllerMethod<void, any>({
        path: '/:id',
        type: 'get',
        async handler({ request, replay, errorHandler }) {
          const params = request.params as any;
          const media = await bcms.cache.media.findOne(
            (e) => e._id === params.id,
          );
          if (!media || media.type === 'DIR') {
            throw errorHandler(HttpStatus.NotFound, 'Not found.');
          }
          const fileStream = nodeFs.createReadStream(
            path.join(
              process.cwd(),
              'public',
              'bcms-media',
              ...media.fullPath.split('/'),
            ),
          );
          replay.header('Content-Type', media.mimetype);
          replay.header('Cache-Control', 'max-age=31536000');
          return replay.send(fileStream);
        },
      }),
    };
  },
});
