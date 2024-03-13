import { onBeforeUnmount, ref, type Ref } from 'vue';

export type UseQuery<Data> = {
    // Data
    data: Ref<Data | null>;
    // Is Loaded
    isLoaded: Ref<boolean>;
    // Is ReFetching
    isReFetching: Ref<boolean>;
    // ReFetch data
    reFetch(): Promise<void>;
};

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
    const query: UseQuery<Data> = {
        data: ref(null),
        isLoaded: ref(false),
        isReFetching: ref(false),
        async reFetch() {
            query.isReFetching.value = true;
            query.data.value = await doFetch();
            query.isReFetching.value = false;
            query.isLoaded.value = true;
            for (const onLoadedFnId in onLoadedFns[name]) {
                if (onLoadedFns[name][onLoadedFnId]) {
                    onLoadedFns[name][onLoadedFnId](query.data);
                }
            }
        },
    };
    query.reFetch().then(() => {
        for (const onLoadedFnId in onLoadedFns[name]) {
            if (onLoadedFns[name][onLoadedFnId]) {
                onLoadedFns[name][onLoadedFnId](query.data);
            }
        }
    });
    queries[name] = query;

    onBeforeUnmount(async () => {
        if (onUnmount) {
            onUnmount(query.data);
            if (onLoaded && onLoadedFns[name] && onLoadedFns[name][onLoaded.toString()]) {
                delete onLoadedFns[name][onLoaded.toString()];
            }
        }
    });

    return query;
}
