import { Loader, Point2D, Scene } from 'svemir';
import { AnimationMixer } from 'three';
import { Assets } from './assets';
import { Distance } from './distance';
import { Nogo } from './nogo';

export type CharacterAnimations = 'idle' | 'run' | 'death';

export interface Character {
  setAnimation(name: CharacterAnimations): void;
  setPosition(point: Point2D): void;
  update(t: number): void;
  position(): Point2D;
}

export async function createCharacter(config: {
  nogo: Nogo;
  position: Point2D;
  id: string;
}): Promise<Character> {
  Loader.register([
    {
      name: 'charDeath',
      path: `/assets/character/${config.id}/death.fbx`,
      type: 'fbx',
    },
    {
      name: 'charIdle',
      path: `/assets/character/${config.id}/idle.fbx`,
      type: 'fbx',
    },
    {
      name: 'charRun',
      path: `/assets/character/${config.id}/run.fbx`,
      type: 'fbx',
    },
    {
      name: 'char',
      path: `/assets/character/${config.id}/t.fbx`,
      type: 'fbx',
    },
  ]);
  const loaderUnsub = Loader.onLoaded((item, data) => {
    if (item.name.startsWith('char')) {
      Assets[item.name as keyof typeof Assets] = data as any;
    }
  });
  await Loader.run();
  loaderUnsub();

  const animMix = new AnimationMixer(Assets.char);
  Assets.char.traverse((o) => {
    o.castShadow = true;
    o.receiveShadow = true;
  });
  Assets.char.position.set(
    config.position.x,
    Distance.heightTo(config.position, Assets.ground),
    config.position.z,
  );
  Assets.char.scale.set(0.003, 0.003, 0.003);
  Scene.scene.add(Assets.char);

  const anim = {
    idle: animMix.clipAction(Assets.charIdle.animations[0]),
    run: animMix.clipAction(Assets.charRun.animations[0]),
    death: animMix.clipAction(Assets.charDeath.animations[0]),
  };
  anim.run.timeScale = 0.5;
  let activeAnimation: CharacterAnimations = 'idle';
  anim.idle.play();

  const speed = 0.02;
  let path: Point2D[] = [];
  let wantedPosition: Point2D | undefined = undefined;
  let move = false;

  function calculateNewPosition() {
    if (!wantedPosition && path.length > 0) {
      wantedPosition = path.pop();
      if (wantedPosition) {
        if (!move) {
          anim[activeAnimation].fadeOut(0.2);
          activeAnimation = 'run';
          anim[activeAnimation].reset();
          anim[activeAnimation].fadeIn(0.2);
          anim[activeAnimation].play();
        }
        move = true;
      }
    } else if (!wantedPosition && path.length === 0 && move) {
      move = false;
      anim[activeAnimation].fadeOut(0.2);
      activeAnimation = 'idle';
      anim[activeAnimation].reset();
      anim[activeAnimation].fadeIn(0.2);
      anim[activeAnimation].play();
    }
    if (wantedPosition) {
      const currPoss = new Point2D(
        Assets.char.position.x,
        Assets.char.position.z,
      );
      if (currPoss.isEqual(wantedPosition, speed)) {
        wantedPosition = path.pop();
      } else {
        const x12 = wantedPosition.x - Assets.char.position.x;
        const z12 = wantedPosition.z - Assets.char.position.z;
        const D = Math.sqrt(x12 * x12 + z12 * z12);
        let alpha = parseFloat(Math.acos(x12 / D).toFixed(2));
        // if (x12 < 0 && z12 > 0) {
        //   alpha = Math.PI - alpha;
        if ((x12 < 0 && z12 < 0) || (x12 > 0 && z12 < 0)) {
          alpha = -2 * Math.PI - alpha;
        }
        Assets.char.rotation.y = Math.PI / 2 - alpha;
        const x = speed * Math.cos(alpha);
        let z = Math.sqrt(speed * speed - x * x);
        if ((x12 < 0 && z12 < 0) || (x12 > 0 && z12 < 0)) {
          z = -z;
        }
        const newPosition = new Point2D(
          Assets.char.position.x + x,
          Assets.char.position.z + z,
        );
        Assets.char.position.set(
          newPosition.x,
          Distance.heightTo(newPosition, Assets.ground),
          newPosition.z,
        );
      }
    }
  }

  const self: Character = {
    position() {
      return new Point2D(Assets.char.position.x, Assets.char.position.z);
    },

    setAnimation(name) {
      if (name !== activeAnimation && anim[name]) {
        if (anim[activeAnimation]) {
          anim[activeAnimation].fadeOut(0.2);
        }
        activeAnimation = name;
        anim[name].reset();
        anim[name].fadeIn(0.2);
        anim[name].play();
      }
    },

    setPosition(point) {
      wantedPosition = undefined;
      const timeOffset = Date.now();
      path = config.nogo.aStar(
        new Point2D(Assets.char.position.x, Assets.char.position.z),
        config.nogo.closestValidNode(point),
      );
      console.log(Date.now() - timeOffset);
    },

    update(t) {
      if (animMix) {
        animMix.update(t);
      }
      calculateNewPosition();
      // Assets.char.rotation.y += 0.01;
    },
  };
  return self;
}
