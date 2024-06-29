import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { createMapMaker, MapMaker } from '../map-maker/main.ts';
import { useRoute } from 'vue-router';
import { throwable } from '../util/throwable.ts';
import { SliderInput } from '../components/inputs/slider.tsx';
import { Button } from '../components/button.tsx';
import { useSdk } from '../sdk/main.ts';
import { NotificationService } from '../services/notification.ts';
import { LoaderPage } from '../components/loader.tsx';

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

        onMounted(async () => {
            const el = document.getElementById('renderer');
            if (el) {
                await throwable(async () => {
                    maker = await createMapMaker(
                        el,
                        route.params.mapId as string,
                    );
                    gridData.value.cameraSpeed = maker.camera.camSpeed;
                });
            }
        });

        onBeforeUnmount(() => {
            clearInterval(watchInterval);
            if (maker) {
                maker.destroy();
            }
        });

        async function save() {
            loading.value = true;
            setTimeout(async () => {
                await throwable(
                    async () => {
                        await sdk.landscape.save();
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
                    id={`renderer`}
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
                    <div class={`w-full h-full mt-4 overflow-y-auto`}>
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
