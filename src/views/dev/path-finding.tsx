import { Button } from '@fdd/components/button';
import { Select } from '@fdd/components/inputs/select';
import { TextInput } from '@fdd/components/inputs/text';
import { useSdk } from '@fdd/sdk';
import { GameMapLite, UPoint } from '@fdd/types/rs';
import { getRandomInt } from '@fdd/util/math';
import { defineComponent, onMounted, ref } from 'vue';
import { throwable } from '@fdd/util/throwable.ts';

interface Inputs {
    width: number;
    start?: UPoint;
    end?: UPoint;
    mode: 'obstical' | 'start' | 'end';
    navMesh: number[];
    mapId: string;
}

export const DevPathFinding = defineComponent({
    setup() {
        const sdk = useSdk();
        const maps = ref<GameMapLite[]>([]);
        const inputs = ref<Inputs>({
            width: 10,
            mode: 'obstical',
            navMesh: [],
            mapId: '',
        });

        async function calc() {
            for (let i = 0; i < inputs.value.navMesh.length; i++) {
                if (inputs.value.navMesh[i] === 3) {
                    inputs.value.navMesh[i] = 1;
                }
            }
            const timeOffset = Date.now();
            try {
                if (!inputs.value.start || !inputs.value.end) {
                    return;
                }
                const result = await sdk.pathFinder.rust.aStar({
                    start: inputs.value.start,
                    end: inputs.value.end,
                    navMesh: inputs.value.navMesh,
                    mapSize: {
                        width: inputs.value.width,
                        height: inputs.value.width,
                    },
                });
                console.log('TT', Date.now() - timeOffset);
                if (result) {
                    const arr = result;
                    for (let i = 0; i < arr.length; i++) {
                        const pos = arr[i];
                        const idx = pos.x + inputs.value.width * pos.y;
                        inputs.value.navMesh[idx] = 3;
                    }
                } else {
                    console.warn('No result');
                }
            } catch (err) {
                console.error(err);
            }
        }

        function clear() {
            for (let i = 0; i < inputs.value.navMesh.length; i++) {
                if (inputs.value.navMesh[i] > 1) {
                    inputs.value.navMesh[i] = 1;
                }
            }
        }

        function randomize() {
            inputs.value.navMesh = [];
            for (let y = 0; y < inputs.value.width; y++) {
                for (let x = 0; x < inputs.value.width; x++) {
                    if (x > 10 && x < 180 && y > 10 && y < 180) {
                        inputs.value.navMesh.push(0);
                    } else {
                        inputs.value.navMesh.push(
                            getRandomInt(0, 100) > 65 ? 0 : 1,
                        );
                    }
                }
            }
        }

        onMounted(async () => {
            await throwable(
                async () => {
                    return await sdk.gameMap.getAll();
                },
                async (result) => {
                    maps.value = result;
                },
            );
        });

        return () => (
            <div>
                <h1>Path finding test</h1>
                <div class={`flex gap-4`}>
                    <div
                        style={`
                            width: 700px;
                            height: 700px;
                            display: grid;
                            grid-template-columns: repeat(${inputs.value.width}, 1fr);
                        `}
                    >
                        {inputs.value.navMesh.map((chunk, chunkIdx) => {
                            const x = chunkIdx % inputs.value.width;
                            const y = (chunkIdx - x) / inputs.value.width;
                            const startIdx = inputs.value.start
                                ? inputs.value.start.x +
                                  inputs.value.start.y * inputs.value.width
                                : undefined;
                            const endIdx = inputs.value.end
                                ? inputs.value.end.x +
                                  inputs.value.end.y * inputs.value.width
                                : undefined;
                            let chunkColor = '#fff';
                            if (chunk === 0) {
                                chunkColor = '#666';
                            }
                            if (startIdx && startIdx === chunkIdx) {
                                chunkColor = '#ffaa00';
                            } else if (endIdx && endIdx === chunkIdx) {
                                chunkColor = '#00aaff';
                            } else if (chunk === 3) {
                                chunkColor = '#00ff00';
                            }
                            return (
                                <div
                                    class={`relative border border-black`}
                                    style={`
                                        background-color: ${chunkColor};
                                        width: 100%;
                                        height: 100%;
                                        font-size: 10px;
                                    `}
                                    onClick={() => {
                                        for (
                                            let i = 0;
                                            i < inputs.value.navMesh.length;
                                            i++
                                        ) {
                                            if (inputs.value.navMesh[i] === 3) {
                                                inputs.value.navMesh[i] = 1;
                                            }
                                        }
                                        if (inputs.value.mode === 'start') {
                                            inputs.value.start = {
                                                x,
                                                y,
                                            };
                                        } else if (
                                            inputs.value.mode === 'end'
                                        ) {
                                            inputs.value.end = {
                                                x,
                                                y,
                                            };
                                        } else if (
                                            inputs.value.mode === 'obstical'
                                        ) {
                                            if (
                                                inputs.value.navMesh[chunkIdx] >
                                                0
                                            ) {
                                                inputs.value.navMesh[chunkIdx] =
                                                    0;
                                            } else {
                                                inputs.value.navMesh[chunkIdx] =
                                                    1;
                                            }
                                        }
                                    }}
                                >
                                    <div
                                        class={`absolute top-0 right-0 text-gray-500 flex flex-col gap-0.5 text-right `}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                    <div class={`flex flex-col gap-4`}>
                        <div>Controls</div>
                        <Select
                            label="Game map"
                            options={maps.value.map((e) => {
                                return {
                                    label: e.name,
                                    value: e.id,
                                };
                            })}
                            onInput={async (option) => {
                                inputs.value.mapId = option.value;
                                const gameMap = maps.value.find(
                                    (e) => e.id === option.value,
                                );
                                if (!gameMap) {
                                    return;
                                }
                                inputs.value.width =
                                    gameMap.landscape.size.width;
                                inputs.value.navMesh =
                                    await sdk.gameMap.navMeshMetadata(
                                        option.value,
                                    );
                            }}
                        />
                        <Select
                            label="Mode"
                            options={[
                                {
                                    label: 'Insert obstical',
                                    value: 'obstical',
                                },
                                {
                                    label: 'Insert start',
                                    value: 'start',
                                },
                                {
                                    label: 'Insert end',
                                    value: 'end',
                                },
                            ]}
                            onInput={(option) => {
                                inputs.value.mode = option.value as any;
                            }}
                        />
                        <TextInput
                            label="Width"
                            value={inputs.value.width + ''}
                            onInput={(value) => {
                                inputs.value.width = parseInt(value);
                                inputs.value.navMesh = [];
                                for (let y = 0; y < inputs.value.width; y++) {
                                    for (
                                        let x = 0;
                                        x < inputs.value.width;
                                        x++
                                    ) {
                                        inputs.value.navMesh.push(1);
                                    }
                                }
                            }}
                        />
                        <Button onClick={calc}>Calc</Button>
                        <Button onClick={clear}>Clear</Button>
                        <Button onClick={randomize}>Randomize</Button>
                    </div>
                </div>
            </div>
        );
    },
});
export default DevPathFinding;
