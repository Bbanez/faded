import { AmbientLight, AxesHelper, DirectionalLight, Vector3 } from 'three';
import type { Game, GameConfig } from './types';
import { createCamera } from './camera';
import { Assets, loadAssets } from './assets';
import { createPlayer, Player } from './player';
import { createSvemir, Scene, Ticker } from 'svemir';

async function createUtils() {
  const axHelp = new AxesHelper(500);
  Scene.scene.add(axHelp);
}

async function createGlobalLights(config: { player: Player }): Promise<{
  destroy(): Promise<void>;
}> {
  const ambLight = new AmbientLight(0xffffff, 0.4);
  Scene.scene.add(ambLight);
  const dirLight = new DirectionalLight(0x9e73bc, 0.3);
  const dirLightOffset = {
    x: -400,
    y: 250,
    z: 10,
  };
  dirLight.position.set(
    dirLightOffset.x + config.player.obj.position.x,
    dirLightOffset.y + config.player.obj.position.y,
    dirLightOffset.z + config.player.obj.position.z,
  );
  dirLight.lookAt(
    config.player.obj.position.x,
    config.player.obj.position.y,
    config.player.obj.position.z,
  );
  dirLight.castShadow = true;
  const shadowSizeW = 400;
  const shadowSizeH = 400;
  const shadowRes = 4096;
  dirLight.shadow.mapSize.width = shadowRes;
  dirLight.shadow.mapSize.height = shadowRes;
  dirLight.shadow.camera.left = -shadowSizeW;
  dirLight.shadow.camera.right = shadowSizeW;
  dirLight.shadow.camera.top = shadowSizeH;
  dirLight.shadow.camera.bottom = -shadowSizeH;
  Scene.scene.add(dirLight);

  const tickUnsub = Ticker.subscribe(() => {
    dirLight.position.copy(
      new Vector3(
        dirLightOffset.x + config.player.obj.position.x,
        dirLightOffset.y + config.player.obj.position.y,
        dirLightOffset.z + config.player.obj.position.z,
      ),
    );
    dirLight.lookAt(
      config.player.obj.position.x,
      config.player.obj.position.y,
      config.player.obj.position.z,
    );
  });

  return {
    async destroy() {
      tickUnsub();
    },
  };
}

async function createEnv() {
  Assets.map.scene.uuid = 'map';
  Assets.map.scene.scale.setScalar(200);
  Assets.map.scene.position.set(200, 0, 200);
  Assets.map.scene.traverse((c) => {
    c.receiveShadow = true;
  });
  Scene.scene.add(Assets.map.scene);
}

export async function createGame(config: GameConfig): Promise<Game> {
  config.onReady = async () => {
    // Do nothing for now
  };
  const game = createSvemir(config);
  await loadAssets();
  await createEnv();
  const player = await createPlayer({
    playerId: '',
  });
  const cam = await createCamera({
    player,
  });
  player.cam = cam;
  await createUtils();
  const globalLights = await createGlobalLights({
    player,
  });
  // const mouseRay = await initMouseRay({ cam, player });

  await game.run();

  return {
    s: game,
    async destroy() {
      // await mouseRay.destroy();
      await globalLights.destroy();
      cam.destroy();
      await player.destroy();
      await game.destroy();
    },
  };
}
