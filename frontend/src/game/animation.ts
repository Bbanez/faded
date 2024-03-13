import { AnimationAction, AnimationMixer, Group } from 'three';

export interface AnimationItem {
  anim: AnimationAction;
  fadeIn?: number;
  fadeOut?: number;
}

export interface AnimationConfigItem {
  model: Group,
  fadeIn?: number,
  fadeOut?: number,
}

export class Animation<AnimKeys extends string> {
  mixer: AnimationMixer;
  private active: AnimKeys | 'none' = 'none';
  private anims: {[key: string]: AnimationItem} = {};

  constructor(
    private root: Group,
    private items: {
      [key: string]: AnimationConfigItem;
    },
  ) {
    this.mixer = new AnimationMixer(this.root);
    for (const key in this.items) {
      const item = this.items[key];
      this.anims[key] = {
        anim: this.mixer.clipAction(item.model.animations[0]),
        fadeIn: item.fadeIn || 0.2,
        fadeOut: item.fadeOut || 0.2,
      }
    }
  }

  play(name: AnimKeys) {
    if (this.anims[name]) {
      if (this.anims[this.active]) {
        this.anims[this.active].anim.fadeOut(
          this.anims[this.active].fadeOut as number,
        );
      }
      this.active = name;
      this.anims[this.active].anim.reset();
      this.anims[this.active].anim.fadeIn(
        this.anims[this.active].fadeIn as number,
      );
      this.anims[this.active].anim.play();
    }
  }

  getActiveAnimation() {
    return this.active;
  }
}
