import { ref, Ref } from 'vue';

export interface UseQueryArgsOnLoad<Data> {
  (data: Data | null): void
}

export interface UseQueryArgs<Data> {
  fetch: () => Promise<Data | null>,
  onLoaded?: UseQueryArgsOnLoad<Data>,
}

export function useQuery<Data = unknown>(
  args: UseQueryArgs<Data>
) {
  const output: {
    data: Ref<Data | null>;
    isLoaded: Ref<boolean>;
    isReFetching: Ref<boolean>;
    reFetch(): Promise<Data | null>;
  } = {
    data: ref(null),
    isLoaded: ref(false),
    isReFetching: ref(false),
    async reFetch() {
      output.isReFetching.value = true;
      output.data.value = await args.fetch();
      output.isReFetching.value = false;
      if (args.onLoaded && !output.isLoaded.value) {
        args.onLoaded(output.data.value);
      }
      output.isLoaded.value = true;
      return output.data.value;
    },
  };
  args.fetch()
    .then((result) => {
      output.data.value = result;
      output.isLoaded.value = true;
      if (args.onLoaded) {
        args.onLoaded(result);
      }
    })
    .catch((err) => console.error(err));
  return output;
}
