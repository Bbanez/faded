import { createFS } from '@banez/fs';
import { createBcmsMost } from '@becomes/cms-most';
import { Config } from './config';

async function main() {
  const bcms = createBcmsMost({
    config: {
      cms: {
        origin: Config.cmsOrigin,
        key: {
          id: Config.cmsApiKeyId,
          secret: Config.cmsApiKeySecret,
        },
      },
      media: {
        download: false,
      },
      server: {
        port: 1282,
      },
    },
  });
  const fs = createFS({
    base: process.cwd(),
  });
  if (await fs.exist(['bcms', 'types'])) {
    await fs.deleteDir(['bcms', 'types']);
  }
  const types = await bcms.client.typeConverter.getAll({
    language: 'typescript',
  });
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    await fs.save(
      ['bcms', 'types', ...type.outputFile.split('/')],
      type.content,
    );
  }
  await fs.save(
    ['bcms', 'types', 'index.ts'],
    types
      .map((e) => `export * from './${e.outputFile.replace('.d.ts', '')}';`)
      .join('\n'),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
