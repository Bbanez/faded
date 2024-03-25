export async function execInTimeStep(
    timeStep: number,
    exec: (cTime: number) => void,
) {
    let tickAt = 0;
    return (cTime: number) => {
        if (tickAt < cTime) {
            tickAt = cTime + timeStep;
            exec(cTime);
        }
    };
}
