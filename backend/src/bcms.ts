import { createBcmsMost } from '@becomes/cms-most';
import type { BCMSMost } from '@becomes/cms-most/types';
import type { Module } from 'servaljs';

let bcms: BCMSMost;

export function useBcms() {
  return bcms;
}

export function createBcms(): Module {
  return {
    name: 'BCMS',
    initialize({ next }) {
      async function init() {
        bcms = createBcmsMost();
        await bcms.media.pull();
        await bcms.content.pull();
        await bcms.typeConverter.pull();
      }
      init()
        .then(() => next())
        .catch((err) => next(err));
    },
  };
}
