import { onBeforeUnmount, ref, type Ref } from 'vue';

export type UseQuery<Data> = [
  // Data
  Ref<Data | null>,
  // Is Loaded
  Ref<boolean>,
  // Is ReFetching
  Ref<boolean>,
  // ReFetch data
  () => Promise<void>,
];

export interface UseQueryOnLoaded<Data> {
  (data: Ref<Data | null>): void;
}

const queries: {
  [name: string]: UseQuery<any>;
} = {};

const onLoadedFns: {
  [name: string]: {
    [id: string]: UseQueryOnLoaded<any>;
  };
} = {};

export function useQuery<Data>(
  name: string,
  doFetch: () => Promise<Data | null>,
  onLoaded?: UseQueryOnLoaded<Data>,
  onUnmount?: (data: Ref<Data | null>) => void,
): UseQuery<Data> {
  if (onLoaded) {
    if (!onLoadedFns[name]) {
      onLoadedFns[name] = {};
    }
    onLoadedFns[name][onLoaded.toString()] = onLoaded;
  }
  if (queries[name]) {
    return queries[name];
  }
  const query: UseQuery<Data> = [
    ref(null),
    ref(false),
    ref(false),
    async () => {
      query[2].value = true;
      query[0].value = await doFetch();
      query[2].value = false;
      query[1].value = true;
      for (const onLoadedFnId in onLoadedFns[name]) {
        if (onLoadedFns[name][onLoadedFnId]) {
          onLoadedFns[name][onLoadedFnId](query[0]);
        }
      }
    },
  ];
  query[3]().then(() => {
    for (const onLoadedFnId in onLoadedFns[name]) {
      if (onLoadedFns[name][onLoadedFnId]) {
        onLoadedFns[name][onLoadedFnId](query[0]);
      }
    }
  });
  queries[name] = query;

  onBeforeUnmount(async () => {
    if (onUnmount) {
      onUnmount(query[0]);
      if (
        onLoaded &&
        onLoadedFns[name] &&
        onLoadedFns[name][onLoaded.toString()]
      ) {
        delete onLoadedFns[name][onLoaded.toString()];
      }
    }
  });

  return query;
}
