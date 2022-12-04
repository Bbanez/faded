const { createConfig, createTasks } = require('@banez/npm-tool/index.js');
const { pullCmsTypes } = require('./scripts/pull-types.cjs');

module.exports = createConfig({
  custom: {
    '--cms-types': async () => {
      await createTasks([
        {
          title: 'Pull CMS types',
          task: pullCmsTypes,
        },
      ]).run();
    },
  },
});
