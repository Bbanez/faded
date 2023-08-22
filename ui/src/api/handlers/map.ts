import { FddMapEntryMeta } from "@backend/bcms-types";
import { ControllerItemsResponse } from "@backend/types";
import { Api } from "../main";

export class MapHandler {
  private baseUrl = `/v1/map`;
  private getAllLatch = false;

  constructor(private api: Api) {}

  async getAll(): Promise<FddMapEntryMeta[]> {
    if (this.getAllLatch) {
      return this.api.store.map.items();
    }
    const res = await this.api.send<ControllerItemsResponse<FddMapEntryMeta>>({
      url: `${this.baseUrl}/all`,
    });
    this.api.store.map.set(res.items);
    return res.items;
  }
}