import { Map, MapChunkType } from '@backend/map';
import { Position } from '@backend/types';
import { createMapMaker, MapMaker } from '@ui/game';
import { Layout } from '@ui/layout';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  setup() {
    const editor = ref<HTMLElement | null>(null);
    let maker: MapMaker;
    const map = ref<Map>({
      _id: '',
      createdAt: 0,
      updatedAt: 0,
      size: [10, 10],
      data: {
        level1: [],
      },
    });
    for (let x = 0; x < map.value.size[0]; x++) {
      map.value.data.level1.push({
        rows: [],
      });
      for (let y = 0; y < map.value.size[1]; y++) {
        map.value.data.level1[x].rows.push({
          asset: '',
          type: 'none',
        });
      }
    }
    const selectedChunkType = ref<MapChunkType>('none');
    const hoverOverChunk = ref<Position>([-1, -1]);

    onMounted(async () => {
      if (editor.value) {
        maker = await createMapMaker({
          target: editor.value,
          size: map.value.size,
          map: map.value,
        });
      }
    });

    return () => (
      <Layout class="mapMaker_override">
        <div class="mapMakerEditor">
          <div class="mapMakerEditor--menu">
            <h1>Config</h1>
            <div class="mapMakerEditor--mapToolbar">
              <button
                class={`${selectedChunkType.value === 'edge' ? 'active' : ''}`}
                onClick={() => {
                  selectedChunkType.value = 'edge';
                }}
              >
                Edge
              </button>
              <button
                class={`${
                  selectedChunkType.value === 'ground' ? 'active' : ''
                }`}
                onClick={() => {
                  selectedChunkType.value = 'ground';
                }}
              >
                Ground
              </button>
            </div>
            <div
              class="mapMakerEditor--map"
              style={`grid-template-columns: ${Array(map.value.size[0])
                .fill(`${400 / map.value.size[0]}px`)
                .join(' ')};`}
              onMouseleave={() => {
                hoverOverChunk.value = [-1, -1];
              }}
            >
              {map.value.data.level1.map((col, x) => {
                return col.rows.map((row, y) => (
                  <button
                    class={`mapMakerEditor--map-chunk mapMakerEditor--map-chunk_${
                      hoverOverChunk.value[0] === x &&
                      hoverOverChunk.value[1] === y
                        ? selectedChunkType.value
                        : row.type
                    }`}
                    style={`width: ${400 / map.value.size[0]}px; height: ${
                      400 / map.value.size[0]
                    }px; `}
                    data-position={`${x},${y}`}
                    onMouseenter={() => {
                      hoverOverChunk.value = [x, y];
                    }}
                    onClick={() => {
                      map.value.data.level1[x].rows[y].type =
                        selectedChunkType.value;
                      if (maker) {
                        maker.updateChunks(map.value);
                      }
                    }}
                  />
                ));
              })}
            </div>
          </div>
          <div ref={editor} class="mapMakerEditor--editor" />
        </div>
      </Layout>
    );
  },
});
