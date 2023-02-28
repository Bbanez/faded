import * as YAML from 'yamljs';
import * as util from 'util';
import * as path from 'path';
import * as fs from 'fs';
import type { Module } from '@becomes/purple-cheetah/types';
import { useObjectUtility } from '@becomes/purple-cheetah';

export interface ResponseCodes {
  [key: string]: {
    msg: string;
  };
}

const codes: ResponseCodes = {};

export function createResponseCodes(): Module {
  async function fileTree(dir: string) {
    const ft: string[] = [];
    const files = await util.promisify(fs.readdir)(dir);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        if (file.endsWith('.yml')) {
          ft.push(path.join(dir, file));
        } else if (file.indexOf('.') === -1) {
          const fsstat = await util.promisify(fs.lstat)(
            path.join(dir, file),
          );
          if (fsstat.isFile() === false) {
            (await fileTree(path.join(dir, file))).forEach((e) => {
              ft.push(e);
            });
          }
        }
      }
    }
    return ft;
  }
  return {
    name: 'Response codes',
    initialize(moduleConfig) {
      const objectUtil = useObjectUtility();
      fileTree(path.join(__dirname, 'codes'))
        .then((files) => {
          const buffer: Array<{
            name: string;
            data: ResponseCodes;
          }> = [];
          for (let i = 0; i < files.length; i++) {
            const file = files[i] as string;
            buffer.push({
              name: file,
              data: YAML.load(file),
            });
          }
          for (let i = 0; i < buffer.length; i++) {
            if (typeof buffer[i] !== 'object') {
              throw new Error(
                `${
                  buffer[i].name
                } ---> Expected an "object" but got "${typeof buffer[
                  i
                ]}".`,
              );
            }
            for (const key in buffer[i].data) {
              const data = buffer[i].data;
              try {
                objectUtil.compareWithSchema(data[key], {
                  msg: {
                    __type: 'string',
                    __required: true,
                  },
                });
              } catch (err) {
                const error = err as Error;
                throw new Error(
                  `${buffer[i].name} ---> ${error.message}`,
                );
              }
              if (codes[key]) {
                throw new Error(
                  `${buffer[i].name} ---> Multiple declarations of "${key}".`,
                );
              }
              codes[key] = data[key];
            }
          }
          moduleConfig.next();
        })
        .catch((error) => {
          moduleConfig.next(error);
        });
    },
  };
}

export function responseCode(
  code: string,
  vars?: { [key: string]: string },
): { code: string; message: string } {
  const c = codes[code];
  if (!c) {
    throw new Error(`Code "${code}" does not exist.`);
  }
  let msg = '' + c.msg;
  if (vars) {
    for (const key in vars) {
      msg = msg.replace(new RegExp(`%${key}%`, 'g'), vars[key]);
    }
  }
  return {
    code,
    message: msg,
  };
}
