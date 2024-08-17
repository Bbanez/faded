import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useSdk } from '@fdd/sdk/main.ts';
import { MapMaker, createMapMaker } from '@fdd/map-maker/main';
import { throwable } from '@fdd/util/throwable';
import { NotificationService } from '@fdd/services/notification';
import { Button } from '@fdd/components/button';
import { SliderInput } from '@fdd/components/inputs/slider';
import { LoaderPage } from '@fdd/components/loader';

export const MapMakerView = defineComponent({
    setup() {
        const sdk = useSdk();
        const loading = ref(false);
        const route = useRoute();
        let maker: MapMaker | null = null;
        const gridData = ref<{
            activeCell: [number, number];
            activeChunkName: string;
            cameraSpeed: number;
            cameraPosition: [number, number];
        }>({
            activeCell: [0, 0],
            activeChunkName: '',
            cameraSpeed: 0,
            cameraPosition: [0, 0],
        });
        const showWater = ref(true);

        const watchInterval = setInterval(() => {
            if (maker) {
                gridData.value.activeCell =
                    maker.landscape.gridPlane.activeCell;
                gridData.value.activeChunkName =
                    maker.landscape.gridPlane.previewChunkMesh.name;
                gridData.value.cameraPosition = [
                    maker.camera.followPoint.x,
                    maker.camera.followPoint.z,
                ];
                maker.camera.camSpeed = gridData.value.cameraSpeed;
            }
        }, 100);

        const navMeshData = ref<Array<number[]>>([]);
        let reFetchNavMeshInterval: NodeJS.Timeout | undefined = undefined;

        async function fetchNavMeshData() {
            await throwable(
                async () => {
                    const navMap = await sdk.gameMap.navMeshMetadata(
                        route.params.mapId as string,
                    );
                    return {
                        navMap,
                    };
                },
                async (result) => {
                    if (!maker) {
                        return;
                    }
                    navMeshData.value = [];
                    for (
                        let z = 0;
                        z < maker.landscape.gameMap.landscape.size.depth;
                        z++
                    ) {
                        navMeshData.value.push([]);
                        for (
                            let x = 0;
                            x < maker.landscape.gameMap.landscape.size.width;
                            x++
                        ) {
                            navMeshData.value[z].push(
                                result.navMap[
                                    x +
                                        z *
                                            maker.landscape.gameMap.landscape
                                                .size.width
                                ],
                            );
                        }
                    }
                },
            );
        }

        onMounted(async () => {
            const el = document.getElementById('map-maker-renderer-container');
            if (el) {
                await throwable(async () => {
                    maker = await createMapMaker(
                        el,
                        route.params.mapId as string,
                    );
                    gridData.value.cameraSpeed = maker.camera.camSpeed;
                    return {
                        maker,
                    };
                });
                await fetchNavMeshData();
                reFetchNavMeshInterval = setInterval(() => {
                    fetchNavMeshData();
                }, 100);
            }
        });

        onBeforeUnmount(() => {
            clearInterval(watchInterval);
            clearInterval(reFetchNavMeshInterval);
            if (maker) {
                maker.destroy();
            }
        });

        async function save() {
            loading.value = true;
            setTimeout(async () => {
                await throwable(
                    async () => {
                        await sdk.gameMap.save(route.params.mapId as string);
                    },
                    async () => {
                        NotificationService.push(
                            'success',
                            'Map saved successfully',
                        );
                    },
                );
                loading.value = false;
            }, 100);
        }

        return () => (
            <div>
                <div
                    id={`map-maker-renderer-container`}
                    class={`fixed top-0 left-0 w-screen h-screen`}
                ></div>
                <div
                    class={`fixed top-0 left-0 w-[300px] h-screen bg-black bg-opacity-30 backdrop-blur-lg`}
                ></div>
                <div
                    class={`flex flex-col fixed top-0 right-0 w-[450px] h-screen bg-black bg-opacity-30 backdrop-blur-lg p-4`}
                >
                    <div class={`h-16 text-xs flex flex-col`}>
                        <div>Cell: {gridData.value.activeCell.join(' ')}</div>
                        <div>
                            Camera position:{' '}
                            {gridData.value.cameraPosition
                                .map((e) => e.toFixed(1))
                                .join(' ')}
                        </div>
                        <div>Chunk: {gridData.value.activeChunkName}</div>
                    </div>
                    <div
                        class={`w-full h-full mt-4 overflow-y-auto flex flex-col gap-4`}
                    >
                        <div class={`flex gap-4`}>
                            <Button class={`flex-shrink-0`} onClick={save}>
                                Save changes
                            </Button>
                            <SliderInput
                                label={`Camera speed`}
                                value={gridData.value.cameraSpeed}
                                min={0.1}
                                max={1}
                                onInput={(value) => {
                                    gridData.value.cameraSpeed = value;
                                }}
                            />
                        </div>
                        <Button
                            onClick={() => {
                                if (!maker) {
                                    return;
                                }
                                maker.landscape.water.mesh.visible =
                                    !maker.landscape.water.mesh.visible;
                                showWater.value =
                                    maker.landscape.water.mesh.visible;
                            }}
                        >
                            {showWater.value ? 'Hide water' : 'Show water'}
                        </Button>
                        <div class={`flex flex-col`}>
                            {navMeshData.value.map((cols) => {
                                return (
                                    <div class={`flex`}>
                                        {cols.map((col) => {
                                            return (
                                                <div
                                                    class={`w-1 h-1 ${col > 0 ? 'bg-red-500' : 'bg-white'}`}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {/*<div*/}
                {/*    class={`flex fixed top-0 left-0 w-screen h-screen`}*/}
                {/*    draggable={false}*/}
                {/*>*/}
                {/*    <div class={`w-[350px]`}>aside</div>*/}
                {/*    <div class={`w-[400px]`}>actions</div>*/}
                {/*</div>*/}
                <LoaderPage show={loading.value} />
            </div>
        );
    },
});
