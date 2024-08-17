export function debounce(callback: () => void, t: number): () => void {
    let timeout: NodeJS.Timeout | undefined = undefined;
    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            callback();
        }, t);
    };
}
