import { createBcmsClient } from '@becomes/cms-client';

export const bcmsClient = createBcmsClient({
  cmsOrigin: 'https://cms.vajaga.com',
  key: {
    id: '63753b269fab4733bcf04b9b',
    secret: '',
  },
  enableCache: true,
});
