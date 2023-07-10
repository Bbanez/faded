import { v4 as uuidv4 } from 'uuid';

export interface ModalOnDone<OutputData> {
  (data: OutputData): void | Promise<void>;
}

export interface ModalOnCancel {
  (): void | Promise<void>;
}

export interface ModalInputDefaults<OutputData> {
  title?: string;
  onDone?: ModalOnDone<OutputData>;
  onCancel?: ModalOnCancel;
}

export interface BCMSModalServiceItem<
  OutputData,
  InputData extends ModalInputDefaults<OutputData>,
> {
  show(data: InputData): void;
  hide(): void;
  subscribe?(eventName: string, handler: (event: Event) => void): () => void;
  triggerEvent?(eventName: string, event: Event): void;
  onShow(data: InputData): void;
}

function modalNotImplemented<
  OutputData,
  InputData extends ModalInputDefaults<OutputData>,
>(): BCMSModalServiceItem<OutputData, InputData> {
  const subs: {
    [name: string]: {
      [id: string]: (event: Event) => void;
    };
  } = {};

  return {
    hide() {
      console.error('Not implemented');
    },
    show() {
      console.error('Not implemented');
    },
    subscribe(eventName, handler) {
      const id = uuidv4();
      if (!subs[eventName]) {
        subs[eventName] = {};
      }
      subs[eventName][id] = handler;
      return () => {
        delete subs[eventName][id];
      };
    },
    triggerEvent(eventName, event) {
      if (subs[eventName]) {
        for (const id in subs[eventName]) {
          subs[eventName][id](event);
        }
      }
    },
    onShow() {
      // Do nothing
    },
  };
}

export const ModalService = {
  confirm: modalNotImplemented<
    boolean,
    {
      message: string | JSX.Element;
    } & ModalInputDefaults<boolean>
  >(),
  userSearch: modalNotImplemented<void, ModalInputDefaults<void>>(),
};

export type ModalService = typeof ModalService;
