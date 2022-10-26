import { defineComponent, ref } from 'vue';
import { Panel, PanelGroup, PanelItem } from '../game';

export const DevPanel = defineComponent({
  setup() {
    const groups = ref<PanelGroup[]>([]);

    Panel.subscribe((group) => {
      groups.value.push(group);
    });

    function panelItem(item: PanelItem) {
      return (
        <div class="panel--item">
          {item.type === 'input' ? (
            <>
              <div class="panel--item-name">{item.name}</div>
              <div class="panel--item-value">
                {item.range ? (
                  <>
                    <div>{item.value}</div>
                    <input
                      type="range"
                      min={item.range[0]}
                      max={item.range[1]}
                      value={item.value}
                      step={item.range[2]}
                      onInput={(event) => {
                        const target = event.target as HTMLInputElement;
                        item.value = target.valueAsNumber;
                        if (item.onChange) {
                          item.onChange(item.value);
                        }
                      }}
                    />
                  </>
                ) : (
                  <input
                    type="number"
                    value={item.value}
                    onChange={(event) => {
                      const target = event.target as HTMLInputElement;
                      item.value = target.valueAsNumber;
                      if (item.onChange) {
                        item.onChange(item.value);
                      }
                    }}
                  />
                )}
              </div>
            </>
          ) : item.type === 'info' ? (
            <>
              <div class="panel--item-name">{item.name}</div>
              <div class="panel--item-value">{item.value}</div>
            </>
          ) : (
            ''
          )}
        </div>
      );
    }

    function panelGroup(group: PanelGroup) {
      return (
        <div class="panel--group">
          <button
            class="panel--group-toggle"
            onClick={() => {
              group.extended = !group.extended;
            }}
          >
            {group.name}
          </button>
          {group.extended && (
            <>
              <div class="panel--items">
                {group.items.map((item) => panelItem(item))}
              </div>
              {group.groups && (
                <div class="panel--groups">
                  {group.groups.map((e) => panelGroup(e))}
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    return () => (
      <div class="panel">
        <div class="panel--wrapper">
          <div class="panel--title">Dev panel</div>
          <div class="panel--groups">
            {groups.value.map((group) => panelGroup(group))}
          </div>
        </div>
      </div>
    );
  },
});
