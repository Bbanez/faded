const nodefs = require('fs/promises');
const path = require('path');
const { createFS } = require('@banez/fs');
const { createBcmsClient } = require('@becomes/cms-client');

/**
 *
 * @param {import('@becomes/cms-client/types').BCMSClientMediaResponseItem} media
 * @param {import('@becomes/cms-client/types').BCMSClientMediaResponseItem[]} allMedia
 * @returns {string}
 */
function resolveMediaPath(media, allMedia) {
  if (!media.isInRoot) {
    const parent = allMedia.find((e) => e._id === media.parentId);
    if (parent) {
      return `${resolveMediaPath(parent, allMedia)}/${media.name}`;
    }
  }
  return `/${media.name}`;
}

async function main() {
  const fs = createFS({
    base: path.join(process.cwd()),
  });
  const client = createBcmsClient({
    // cmsOrigin: 'https://cms.vajaga.com',
    cmsOrigin: 'http://localhost:8080',
    key: {
      id: '6581b5b277fc80f2f2159c1f',
      secret:
        'b0742c33650ba4e879db40ae26c6dd2c75abffe3a1c54ad535aa1589bd25e3d7',
    },
  });
  // Cleanup
  {
    const removeDirs = [
      ['public', 'bcms'],
      ['src', 'types', 'bcms'],
      ['src-tauri', 'src', 'bcms'],
    ];
    for (let i = 0; i < removeDirs.length; i++) {
      const dir = removeDirs[i];
      if (await fs.exist(dir)) {
        await fs.deleteDir(dir);
      }
    }
  }
  const tsTypes = await client.typeConverter.getAll({
    language: 'typescript',
  });
  /**
   * @type {string[]}
   */
  let index = [];
  for (let i = 0; i < tsTypes.length; i++) {
    const tsType = tsTypes[i];
    if (
      // true
      tsType.outputFile.includes('fdd_')
    ) {
      await fs.save(
        ['src', 'types', 'bcms', ...tsType.outputFile.split('/')],
        tsType.content,
      );
      index.push(`export * from './${tsType.outputFile}';`);
    }
  }
  await fs.save(['src', 'types', 'bcms', 'index.d.ts'], index.join('\n'));
  const rustTypes = await client.typeConverter.getAll({
    language: 'rust',
  });
  if (await fs.exist(['src-tauri', 'src', 'bcms'])) {
    await fs.deleteDir(['src-tauri', 'src', 'bcms']);
  }
  index = [];
  for (let i = 0; i < rustTypes.length; i++) {
    const rustType = rustTypes[i];
    if (
      rustType.outputFile.includes('fdd_') ||
      rustType.outputFile === 'media.rs' ||
      rustType.outputFile === 'content.rs' ||
      rustType.outputFile.endsWith('mod.rs')
      // true
    ) {
      if (rustType.outputFile.endsWith('mod.rs')) {
        await fs.save(
          ['src-tauri', 'src', 'bcms', ...rustType.outputFile.split('/')],
          rustType.content
            .split('\n')
            .filter((line) => {
              return (
                line.includes('fdd_') ||
                line === 'pub mod entry;' ||
                line === 'pub mod r#enum;' ||
                line === 'pub mod group;' ||
                line === 'pub mod template;' ||
                line === 'pub mod widget;' ||
                line === 'pub mod media;' ||
                line === 'pub mod content;'
              );
            })
            .join('\n'),
        );
      } else {
        await fs.save(
          ['src-tauri', 'src', 'bcms', ...rustType.outputFile.split('/')],
          rustType.content,
        );
      }
    }
  }
  const templates = await client.template.getAll();
  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    console.log(`[${i + 1}/${templates.length}] Entries for ${template.label}`);
    const entries = await client.entry.getAll({
      template: template._id,
      pLang: 'rust',
    });
    await fs.save(
      ['public', 'bcms', 'content', template.name + '.json'],
      JSON.stringify(entries, null, 2).replace(
        /src": "\/faded/g,
        'src": "/bcms',
      ),
    );
    await nodefs.appendFile(
      path.join(
        process.cwd(),
        'src-tauri',
        'src',
        'bcms',
        'entry',
        template.name + '.rs',
      ),
      [
        '',
        '',
        `pub const ${template.name.toUpperCase()}_META_ITEMS: &str = r#"\n${JSON.stringify(
          entries.map((e) => {
            return e.meta.en;
          }),
          null,
          4,
        )
          .replace(/src": "\/faded/g, 'src": "/bcms')
          .replace(/"#/g, '"\\#')}\n"#;`,
      ].join('\n'),
    );
  }
  const media = await client.media.getAll();
  for (let i = 0; i < media.length; i++) {
    const item = media[i];
    const path = resolveMediaPath(item, media);
    if (item.type !== 'DIR' && path.startsWith('/faded')) {
      console.log(path);
      await fs.save(
        ['public', 'bcms', ...path.split('/').slice(2)],
        await item.bin(),
      );
    }
  }
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
