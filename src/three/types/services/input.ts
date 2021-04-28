export interface InputServiceState {
  keyboard: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    key: string;
  };
  mouse: {
    x: number;
    y: number;
    click: boolean;
  };
}
export enum InputServiceSubscriptionType {
  KEY_UP,
  KEY_DOWN,
  MOUSE_UP,
  MOUSE_DOWN,
  MOUSE_MOVE,
  ALL,
}
export type InputServiceHandler = (
  type: 'k' | 'm',
  state: InputServiceState,
  event: KeyboardEvent | MouseEvent
) => void | Promise<void>;
export interface InputServicePrototype {
  subscribe(
    type: InputServiceSubscriptionType,
    handler: InputServiceHandler
  ): () => void;
}
