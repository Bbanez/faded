import { Application, Container, Graphics } from 'pixi.js';
import { Player } from './player';
import { Ticker } from './ticker';
import { Keyboard } from './keyboard';
import { Mouse } from './mouse';
import { Map } from './map';
import { Config } from './config';

export interface Game {
  destroy(): void;
}

export class Game {
  static app: Application;
  private static resizeTimeout: NodeJS.Timeout;
  private static player: Player;

  static async create(container: HTMLElement): Promise<void> {
    Keyboard.init();
    Mouse.init();
    window.addEventListener('resize', Game.onResize);
    Game.app = new Application({
      antialias: true,
      width: window.innerWidth,
      height: window.innerHeight,
      background: 0x000000,
      backgroundColor: 0x000000,
    });
    Game.app.ticker.add(() => {
      Ticker.tick();
    });
    await Map.load('');
    container.appendChild(Game.app.view as any);
    const playerContainer = new Container();
    const rect = new Graphics();
    rect.beginFill(0xffffff);
    rect.drawRect(0, 0, Config.chunkSize, 2.5 * Config.chunkSize);
    rect.endFill();
    playerContainer.addChild(rect);
    Game.player = new Player(playerContainer);
    Game.app.stage.addChild(playerContainer);
  }

  private static onResize() {
    clearTimeout(Game.resizeTimeout);
    Game.resizeTimeout = setTimeout(() => {
      Game.app.renderer.resize(window.innerWidth, window.innerHeight);
    }, 500);
  }

  static destroy(): void {
    window.removeEventListener('resize', Game.onResize);
  }
}
