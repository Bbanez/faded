const { ChildProcess } = require('@banez/child_process');
const { createConfig, createTasks } = require('@banez/npm-tool');
const path = require('path');
const util = require('util');
const fs = require('fs');
const fsp = require('fs/promises');
const fse = require('fs-extra');

/**
 * @typedef {{
 *  rel: string;
 *  abs: string;
 * }} FileTreeItem
 */

/**
 *
 * @param {string} startingLocation
 * @param {string} location
 * @returns {Promise<FileTreeItem[]>}
 */
async function fileTree(startingLocation, location) {
  /**
   * @type FileTreeItem[]
   */
  const output = [];
  const basePath = path.join(startingLocation, location);
  const files = await util.promisify(fs.readdir)(basePath);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(basePath, file);
    const stat = await util.promisify(fs.lstat)(filePath);
    if (stat.isDirectory()) {
      const children = await fileTree(
        startingLocation,
        path.join(location, file),
      );
      for (let j = 0; j < children.length; j++) {
        const child = children[j];
        output.push(child);
      }
    } else {
      output.push({
        abs: filePath,
        rel: location,
      });
    }
  }
  return output;
}
async function fixImports() {
  const filePaths = await fileTree(path.join(process.cwd(), 'dist'), '');
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    if (filePath.abs.endsWith('.js')) {
      let replacer = './';
      if (filePath.rel !== '') {
        const depth = filePath.rel.split('/').length;
        replacer = new Array(depth - 1).fill('..').join('/');
      }
      const file = (await util.promisify(fs.readFile)(filePath.abs)).toString();
      const fileFixed = file.replace(/@faded/g, replacer);
      if (file !== fileFixed) {
        await util.promisify(fs.writeFile)(filePath.abs, fileFixed);
      }
    }
  }
}

module.exports = createConfig({
  bundle: {
    extend: [
      {
        title: 'Fix imports',
        task: async () => {
          await fixImports();
        },
      },
      {
        title: 'Copy response codes',
        task: async () => {
          await fse.copy(
            path.join(process.cwd(), 'src', 'response-code', 'codes'),
            path.join(process.cwd(), 'dist', 'src', 'response-code', 'codes'),
          );
        },
      },
      {
        title: 'Create custom package.json',
        task: async () => {
          const packageJson = JSON.parse(
            await fsp.readFile(path.join(process.cwd(), 'package.json')),
          );
          packageJson.devDependencies = undefined;
          packageJson.nodemonConfig = undefined;
          packageJson.scripts = {
            start: 'node src/main.js',
          };
          await fsp.writeFile(
            path.join(process.cwd(), 'dist', 'package.json'),
            JSON.stringify(packageJson, null, '  '),
          );
        },
      },
    ],
  },
  custom: {
    '--dev': async () => {
      ChildProcess.spawn('npm', ['run', 'dev'], {
        cwd: path.join(process.cwd(), 'client'),
        stdio: 'inherit',
      });
      ChildProcess.spawn('npm', ['run', 'backend:dev'], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
    },
  },
});
