import {
  Euler,
  Vector3,
  Object3D,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  Group,
  AnimationMixer,
  AnimationAction,
} from 'three';
import type {
  BoundingBox,
  BoxDimensions,
  Entity,
  EntityObject,
  PositionVector,
} from '../types';
import { BoundingBoxFactory } from '../factories';
import { Loader } from '../util';

export async function createEntity(config: {
  object?: EntityObject;
  model?: {
    fbx?: {
      main: string;
      animations?: {
        [name: string]: string;
      };
      onMainLoad?: (object: EntityObject) => void;
      onAnimLoad?: (anim: Group, object: EntityObject, name: string) => void;
    };
  };
  bb?: BoundingBox;
  dimensions?: BoxDimensions;
  coordinateDelta?: PositionVector;
}): Promise<Entity> {
  let object: EntityObject;
  let bb: BoundingBox | undefined;
  let dimensions: BoxDimensions | undefined;
  let coordinateDelta: PositionVector | undefined;
  let _bbVisual: Object3D | undefined;
  let animMixer: AnimationMixer | undefined;
  let timestamp = Date.now() / 1000;
  const anims: {
    [name: string]: AnimationAction;
  } = {};
  let activeAnimation = '';

  if (config.object) {
    object = config.object;
  } else if (config.model) {
    if (config.model.fbx) {
      object = await Loader.fbx(config.model.fbx.main);
      if (config.model.fbx.onMainLoad) {
        config.model.fbx.onMainLoad(object);
      }
      animMixer = new AnimationMixer(object);
      // anims['default'] = animMixer.clipAction(object.animations[0]);
      if (config.model.fbx.animations) {
        for (const name in config.model.fbx.animations) {
          const anim = await Loader.fbx(config.model.fbx.animations[name]);
          if (config.model.fbx.onAnimLoad) {
            config.model.fbx.onAnimLoad(anim, object, name);
          }
          anims[name] = animMixer.clipAction(anim.animations[0]);
        }
      }
    } else {
      throw Error('Invalid model configuration.');
    }
  } else {
    throw Error('Neither object nor model has been provided.');
  }
  bb = config.bb;
  dimensions = config.dimensions;
  coordinateDelta = config.coordinateDelta;

  const self: Entity = {
    bb,
    object,
    dimensions,
    transformOrigin: () => {
      // Initial
    },
    coordinateDelta,
    playAnimation(name) {
      if (name !== activeAnimation && anims[name]) {
        if (anims[activeAnimation]) {
          anims[activeAnimation].fadeOut(0.2);
        }
        activeAnimation = name;
        anims[name].reset();
        anims[name].fadeIn(0.2);
        anims[name].play();
      }
    },
    addToScene(scene) {
      scene.add(object);
    },
    removeFromScene(scene) {
      scene.remove(object);
    },
    enableBBVisual(scene) {
      if (bb && coordinateDelta && dimensions) {
        if (_bbVisual) {
          scene.remove(_bbVisual);
        }
        _bbVisual = new Mesh(
          new BoxGeometry(bb.width, bb.height, bb.depth),
          new MeshStandardMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.3,
          })
        );
        _bbVisual.position.copy(object.position);
        _bbVisual.rotation.copy(object.rotation);
        scene.add(_bbVisual);
      }
    },
    disableBBVisual(scene) {
      if (_bbVisual) {
        scene.remove(_bbVisual);
      }
    },
    update(position, rotation?) {
      if (coordinateDelta && dimensions) {
        if (position) {
          self.setPosition(position);
        }
        if (rotation) {
          self.setRotation(rotation);
        }
        self.transformOrigin(this);
        self.updateBoundingBox();
      }
    },
    updateAnimationMixer(t: number) {
      if (animMixer) {
        animMixer.update(t - timestamp);
        timestamp = t;
      }
    },
    updateBoundingBox() {
      if (coordinateDelta && dimensions) {
        bb = BoundingBoxFactory.fromDimensions({
          pos: object.position,
          rotation: object.rotation,
          delta: coordinateDelta,
          depth: dimensions.depth,
          height: dimensions.height,
          width: dimensions.width,
        });
        if (_bbVisual) {
          _bbVisual.position.set(bb.position.x, bb.position.y, bb.position.z);
          _bbVisual.rotation.copy(object.rotation);
        }
      }
    },
    setObject(_object) {
      object = _object;
    },
    getObject() {
      return object;
    },
    setBB(_bb) {
      bb = _bb;
    },
    getBB() {
      return bb;
    },
    setPosition(position) {
      if (position instanceof Vector3) {
        object.position.copy(position);
      } else {
        object.position.set(position.x, position.y, position.z);
      }
    },
    getPosition() {
      return object.position;
    },
    setRotation(rotation) {
      if (rotation instanceof Euler) {
        object.rotation.copy(rotation);
      } else {
        object.rotation.set(rotation.x, rotation.y, rotation.z);
      }
    },
    getRotation() {
      return object.rotation;
    },
    setDimensions(_dimensions) {
      dimensions = _dimensions;
    },
    getDimensions() {
      return dimensions;
    },
    setCoordinateDelta(delta) {
      coordinateDelta = delta;
    },
    getCoordinateDelta() {
      return coordinateDelta;
    },
  };
  return self;
}
