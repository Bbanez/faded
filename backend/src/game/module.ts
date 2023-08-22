import * as path from 'path';
import * as Jimp from 'jimp';
import type { Module } from 'servaljs';
import { Nogo } from './nogo';
import { Point2D } from './math';

export function createGame(): Module {
  return {
    name: 'Game',
    initialize({ next }) {
      // const fs = createFS({
      //   base: process.cwd(),
      // });
      async function init() {
        const imageRaw = await Jimp.read(
          path.join(process.cwd(), 'public', 'game', 'maps', '0', 'nogo.jpg'),
        );
        imageRaw
          .resize(150, 150)
          .write(path.join('public', 'game', 'maps', '0', 'nogo-150x150.jpg'));
        const imageW = imageRaw.getWidth();
        const imageH = imageRaw.getHeight();
        const pixelArray: number[][] = [];
        for (let z = 0; z < imageH; z++) {
          pixelArray.push([]);
          for (let x = 0; x < imageW; x++) {
            const pixelValue = Jimp.intToRGBA(imageRaw.getPixelColor(x, z));
            pixelArray[z].push(pixelValue.r);
          }
        }
        const nogo = new Nogo(pixelArray, new Point2D(100, 100));
        // let nogoMap = '';
        // for (let startZ = 0; startZ < imageH; startZ++) {
        //   for (let startX = 0; startX < imageW; startX++) {
        //     for (let endZ = startZ; endZ < imageH; endZ++) {
        //       for (let endX = startX + 1; endX < imageW; endX++) {
        //         if (startX !== endX || startZ !== endZ) {
        //           const id = `${startX}_${startZ}-${endX}_${endZ}`;
        //           process.stdout.write(
        //             `[${startX}, ${startZ} - ${endX}, ${endZ}] ... `,
        //           );
        //           const result = nogo.aStar(
        //             new Point2D(startX, startZ),
        //             new Point2D(endX, endZ),
        //           );
        //           nogoMap += `${id} ${result
        //             .map((e) => `${e.x},${e.z}`)
        //             .join('_')}\n`;
        //           console.log('done');
        //         }
        //       }
        //     }
        //     await fs.save(
        //       [
        //         'public',
        //         'game',
        //         'maps',
        //         '0',
        //         `nogo-map_${startX}-${startZ}.txt`,
        //       ],
        //       nogoMap,
        //     );
        //     nogoMap = '';
        //   }
        // }
        console.log(nogo.aStar(new Point2D(10, 10), new Point2D(35, 85)));
      }
      init()
        .then(() => next())
        .catch((err) => next(err));
    },
  };
}
