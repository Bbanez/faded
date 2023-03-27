import { createBcmsMost } from '@becomes/cms-most';
import type { BCMSMost } from '@becomes/cms-most/types';
import { BCMSImageConfig } from '@becomes/cms-most/frontend';
import type { Module } from '@becomes/purple-cheetah/types';
import { Config } from './config';

let bcms: BCMSMost;

export function useBcms(): BCMSMost {
  return bcms;
}

async function init() {
  BCMSImageConfig.cmsOrigin = Config.cmsOrigin;
  BCMSImageConfig.publicApiKeyId = Config.cmsApiKeyId;
  BCMSImageConfig.localeImageProcessing = false;
  bcms = createBcmsMost({
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
  await bcms.content.pull();
  await bcms.media.pull();
  await bcms.typeConverter.pull();
  await bcms.socketConnect();
}

export function createBcms(): Module {
  return {
    name: 'BCMS',
    initialize({ next }) {
      init()
        .then(() => {
          next();
        })
        .catch((err) => {
          next(err);
        });
    },
  };
}
