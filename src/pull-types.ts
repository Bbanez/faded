import { bcmsClient } from './bcms-client';
import { createFS } from '@banez/fs';

async function main() {
  const fs = createFS({
    base: process.cwd(),
  });
  if (await fs.exist(['bcms', 'types'])) {
    await fs.deleteDir(['bcms', 'types']);
  }
  const types = await bcmsClient.typeConverter.getAll({
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
