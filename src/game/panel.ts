import { v4 as uuidv4 } from 'uuid';

export type PanelItemType = 'input' | 'info' | 'collection';

export interface PanelItem {
  name: string;
  type: PanelItemType;
  value: number | string;
  range?: [number, number, number];
  onChange?(value: number): void;
  update?(value: string): void;
}

export interface PanelGroup {
  name: string;
  extended: boolean;
  items: PanelItem[];
  groups?: PanelGroup[];
}

export class Panel {
  private static groups: PanelGroup[] = [];
  private static subs: {
    [id: string]: (group: PanelGroup) => void;
  } = {};

  static addGroup(group: PanelGroup): void {
    Panel.groups.push(group);
    for (const id in Panel.subs) {
      Panel.subs[id](group);
    }
  }

  static subscribe(handler: (group: PanelGroup) => void): () => void {
    const id = uuidv4();
    Panel.subs[id] = handler;
    return () => {
      delete Panel.subs[id];
    };
  }
}
