export interface ControllerItemsResponse<Item> {
  items: Item[];
  total: number;
  offset: number;
  limit: number;
}

export interface ControllerItemResponse<Item> {
  item: Item;
}
