const path = require('path');
const { config } = require('dotenv');
config({
  path: path.join(process.cwd(), 'backend', '.env'),
});
const { createFS } = require('@banez/fs');
const { ChildProcess } = require('@banez/child_process');
const { createConfig } = require('@banez/npm-tool');
const { StringUtility } = require('@banez/string-utility');

const fs = createFS({
  base: process.cwd(),
});

module.exports = createConfig({
  custom: {
    '--postinstall': async () => {
      await ChildProcess.spawn('npm', ['i'], {
        cwd: path.join(process.cwd(), 'backend'),
        env: process.env,
        stdio: 'inherit',
      });
      await ChildProcess.spawn('npm', ['i'], {
        cwd: path.join(process.cwd(), 'ui'),
        env: process.env,
        stdio: 'inherit',
      });
    },

    '--setup': async () => {
      const dirs = [['db'], ['backend', 'logs'], ['backend', 'bcms']];
      for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i];
        if (!(await fs.exist(dir))) {
          await fs.mkdir(dir);
        }
      }
      const files = [['backend', '.env']];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!(await fs.exist(file, true))) {
          await fs.save(file, '');
        }
      }
    },

    '--pre-commit': async () => {
      const whatToCheck = {
        backend: false,
        ui: false,
      };
      let gitOutput = '';
      await ChildProcess.advancedExec('git status', {
        cwd: process.cwd(),
        doNotThrowError: true,
        onChunk(type, chunk) {
          gitOutput += chunk;
          process[type].write(chunk);
        },
      }).awaiter;
      const paths = StringUtility.allTextBetween(gitOutput, '   ', '\n');
      for (let i = 0; i < paths.length; i++) {
        const p = paths[i];
        if (p.startsWith('backend/')) {
          whatToCheck.backend = true;
        } else if (p.startsWith('ui/')) {
          whatToCheck.sdk = true;
        }
      }
      if (whatToCheck.backend) {
        await ChildProcess.spawn('npm', ['run', 'lint'], {
          cwd: path.join(process.cwd(), 'backend'),
          stdio: 'inherit',
        });
        await ChildProcess.spawn('npm', ['run', 'build:noEmit'], {
          cwd: path.join(process.cwd(), 'backend'),
          stdio: 'inherit',
        });
      }
      if (whatToCheck.ui) {
        await ChildProcess.spawn('npm', ['run', 'lint'], {
          cwd: path.join(process.cwd(), 'ui'),
          stdio: 'inherit',
        });
        await ChildProcess.spawn('npm', ['run', 'type-check'], {
          cwd: path.join(process.cwd(), 'ui'),
          stdio: 'inherit',
        });
      }
    },
  },
});
