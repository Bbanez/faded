import type { ObjectPropSchema } from '@becomes/purple-cheetah/types';

export type Tuple<T = number> = [T, T];

export const TupleSchema: ObjectPropSchema = {
  __type: 'array',
  __required: true,
  __child: {
    __type: 'number',
  },
};

export class MathUtil {}
