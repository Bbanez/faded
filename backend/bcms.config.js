const { createBcmsMostConfig } = require('@becomes/cms-most');

module.exports = createBcmsMostConfig({
  cms: {
    origin: process.env.BCMS_API_ORIGIN || '',
    key: {
      id: process.env.BCMS_API_KEY || '',
      secret: process.env.BCMS_API_KEY_SECRET || '',
    },
  },
  media: {
    download: true,
    output: 'public',
  },
});
