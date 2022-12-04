const { createFS } = require('@banez/fs');
const { createBcmsClient } = require('@becomes/cms-client');

exports.pullCmsTypes = async () => {
  const bcmsClient = createBcmsClient({
    cmsOrigin: 'https://cms.vajaga.com',
    key: {
      id: '636f4d9d9fab4733bcf04b49',
      secret:
        '8de3f809c17598582d5f06c47ccb5994002d521b7903f127eea9c98e4a6f3516',
    },
    enableCache: true,
  });
  const fs = createFS({
    base: process.cwd(),
  });
  if (await fs.exist(['src', 'bcms', 'types'])) {
    await fs.deleteDir(['src', 'bcms', 'types']);
  }
  const types = await bcmsClient.typeConverter.getAll({
    language: 'typescript',
  });
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    await fs.save(
      ['src', 'bcms', 'types', ...type.outputFile.split('/')],
      type.content,
    );
  }
  await fs.save(
    ['src', 'bcms', 'types', 'index.ts'],
    types
      .map((e) => `export * from './${e.outputFile.replace('.d.ts', '')}';`)
      .join('\n'),
  );
};
