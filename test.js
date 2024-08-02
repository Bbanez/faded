async function ma() {
    const arr = Array(1000000)
        .fill('')
        .map(() => {
            return async (num) => {
                return num + 1;
            };
        });
    const timeOffset = Date.now();
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += await arr[i](i);
    }
    console.log(Date.now() - timeOffset, sum);
}

ma().catch((err) => {
    console.error(err);
    process.exit(1);
});

// async function m() {
//     const arr = Array(1000000)
//         .fill('')
//         .map(() => {
//             return (num) => {
//                 return num + 1;
//             };
//         });
//     const timeOffset = Date.now();
//     let sum = 0;
//     for (let i = 0; i < arr.length; i++) {
//         sum += arr[i](i);
//     }
//     console.log(Date.now() - timeOffset, sum);
// }

// m();
