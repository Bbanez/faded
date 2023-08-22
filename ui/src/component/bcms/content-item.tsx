import {
  BCMSEntryContentNodeType,
  BCMSEntryContentParsedItem,
} from '@becomes/cms-client/types';
import { defineComponent, PropType } from 'vue';
import type { BCMSWidgetComponents } from './content-manager';

export const BCMSContentItem = defineComponent({
  props: {
    item: {
      type: Object as PropType<BCMSEntryContentParsedItem>,
      required: true,
    },
    components: {
      type: Object as PropType<BCMSWidgetComponents>,
      required: true,
    },
    nodeParser: Function as PropType<
      (item: BCMSEntryContentParsedItem) => string
    >,
  },
  setup(props) {
    function resolveWidget(name: string) {
      if (props.components[name]) {
        const Widget = props.components[name];
        return <Widget data={props.item.value} />;
      } else {
        return (
          <div style={{ display: 'none' }} data-error>
            Widget {props.item.name} is not handled
          </div>
        );
      }
    }

    return () => (
      <>
        {props.item.name &&
        props.item.type === BCMSEntryContentNodeType.widget ? (
          resolveWidget(props.item.name)
        ) : (
          <div
            class={`content-primitive content--${props.item.type}`}
            v-html={
              props.nodeParser
                ? props.nodeParser(props.item)
                : (props.item.value as string)
            }
          />
        )}
      </>
    );
  },
});
