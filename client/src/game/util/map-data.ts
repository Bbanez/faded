export async function getMapChunkData(path: string): Promise<{
  solidChunks: boolean[][];
  platformChunks: boolean[][];
  width: number;
  height: number;
} | null> {
  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
      } else {
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height);
        const yChunks = img.height;
        const xChunks = img.width;
        const solidChunks: boolean[][] = [];
        const platformChunks: boolean[][] = [];
        for (let y = 0; y < yChunks; y++) {
          solidChunks.push([]);
          platformChunks.push([]);
          for (let x = 0; x < xChunks; x++) {
            solidChunks[y].push(data.data[x * 4 + xChunks * 4 * y] > 240);
            platformChunks[y].push(
              data.data[2 + x * 4 + xChunks * 4 * y] > 240,
            );
          }
        }
        resolve({
          height: yChunks,
          width: xChunks,
          platformChunks,
          solidChunks,
        });
      }
    };
    img.src = path;
  });
}
