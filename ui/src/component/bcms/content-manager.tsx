import type {
  BCMSEntryContentParsedItem,
  BCMSPropRichTextDataParsed,
} from '@becomes/cms-client/types';
import { CSSProperties, defineComponent, DefineComponent, PropType } from 'vue';
import { BCMSContentItem } from './content-item';

export interface BCMSWidgetComponents {
  [bcmsWidgetName: string]: DefineComponent<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  }>;
}

export const BCMSContentManager = defineComponent({
  props: {
    id: String,
    style: Object as PropType<string | CSSProperties>,
    class: String,
    items: {
      type: Array as PropType<BCMSPropRichTextDataParsed>,
      required: true,
    },
    widgetComponents: {
      type: Object as PropType<BCMSWidgetComponents>,
      required: true,
    },
    nodeParser: Function as PropType<
      (item: BCMSEntryContentParsedItem) => string
    >,
  },
  setup(props) {
    return () => (
      <div
        id={props.id}
        style={props.style}
        class={`content ${props.class || ''}`}
      >
        {props.items.map((_item, _itemIdx) => {
          return (
            <>
              {_item instanceof Array ? (
                <>
                  {_item.map((item, itemIdx) => {
                    return (
                      <BCMSContentItem
                        key={`${_itemIdx}_${itemIdx}`}
                        item={item}
                        components={props.widgetComponents}
                        nodeParser={props.nodeParser}
                      />
                    );
                  })}
                </>
              ) : (
                <BCMSContentItem
                  key={_itemIdx}
                  item={_item}
                  components={props.widgetComponents}
                  nodeParser={props.nodeParser}
                />
              )}
            </>
          );
        })}
      </div>
    );
  },
});
