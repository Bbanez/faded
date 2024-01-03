import { ref } from 'vue';
import { Storage, StorageKeys } from '../game/storage';
import { Model } from './models/_model';

export interface DBQuery<ItemType> {
  (item: ItemType): boolean | number | string | unknown;
}

export interface DBMethods<ItemType extends Model, Methods = unknown> {
  (db: DB<ItemType>): Methods;
}

export interface DB<
  ItemType extends Model,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Methods = unknown
> {
  setup(): Promise<void>;
  items(): ItemType[];
  find(query: DBQuery<ItemType>): ItemType | null;
  findById(id: string): ItemType | null;
  findMany(query: DBQuery<ItemType>): ItemType[];
  findManyById(ids: string[]): ItemType[];
  set(items: ItemType | ItemType[]): Promise<void>;
  remove(ids: string | string[]): Promise<void>;
  methods: Methods;
}

export function createDB<
  ItemType extends Model,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Methods = unknown
>(
  name: StorageKeys,
  idKey: keyof ItemType,
  methods?: DBMethods<ItemType, Methods>
) {
  const store = ref<ItemType[]>([]);
  async function getItems(): Promise<ItemType[]> {
    if (store.value.length > 0) {
      return store.value as ItemType[];
    }
    const res = await Storage.get<ItemType[]>(name);
    if (!res) {
      return [];
    }
    store.value = res as any;
    return res;
  }
  const self: DB<ItemType, Methods> = {
    async setup() {
      await getItems();
    },

    items() {
      return store.value as ItemType[];
    },

    find(query) {
      const items = store.value;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (query(item as ItemType)) {
          return item as ItemType;
        }
      }
      return null;
    },
    findById(id: string) {
      const items = store.value as ItemType[];
      const output = items.find((e) => e[idKey] === id);
      return (output as ItemType) || null;
    },

    findMany(query) {
      const items = store.value;
      const output: ItemType[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (query(item as ItemType)) {
          output.push(items[i] as ItemType);
        }
      }
      return output;
    },

    findManyById(ids) {
      const items = store.value;
      return items.filter((e) => ids.includes(e[idKey as never])) as ItemType[];
    },

    async set(inputItems) {
      const storeItems = await getItems();
      const items = inputItems instanceof Array ? inputItems : [inputItems];
      for (let i = 0; i < items.length; i++) {
        const inputItem = items[i];
        let found = false;
        for (let j = 0; j < storeItems.length; j++) {
          const storeItem = storeItems[j];
          if (storeItem[idKey] === inputItem[idKey]) {
            found = true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            storeItems.splice(j, 1, inputItem as any);
            break;
          }
        }
        if (!found) {
          inputItem.updatedAt = Date.now();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          storeItems.push(inputItem as any);
        }
      }
      await Storage.set(name, storeItems);
    },

    async remove(inputIds: string | string[]) {
      const items = await getItems();
      const ids = inputIds instanceof Array ? inputIds : [inputIds];
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        for (let j = 0; j < items.length; j++) {
          const item = items[j];
          if (item[idKey] === id) {
            items.splice(j, 1);
          }
        }
      }
      await Storage.set(name, items);
    },
    methods: {} as never,
  };
  if (methods) {
    self.methods = methods(self);
  }

  return self;
}
