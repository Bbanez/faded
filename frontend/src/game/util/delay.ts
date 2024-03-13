export async function delay(_t: number) {
  await new Promise<void>((resolve) => {
    // const unsub = Mouse.subscribe(MouseEventType.MOUSE_DOWN, () => {
    //   unsub();
    //   console.log('click');
    //   resolve();
    // });
    setTimeout(() => {
      resolve();
    }, _t);
  });
}
