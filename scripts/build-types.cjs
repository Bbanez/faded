const path = require('path');
const { ChildProcess } = require('@banez/child_process');
const { createFS } = require('@banez/fs');

const fs = createFS({
    base: process.cwd(),
});

async function main() {
    await ChildProcess.spawn('cargo', ['test'], {
        cwd: path.join(process.cwd(), 'src-tauri'),
        stdio: 'inherit'
    });
    if (await fs.exist(['src', 'types', 'rs'])) {
        await fs.deleteDir(['src', 'types', 'rs']);
    }
    await fs.move(['src-tauri', 'bindings'], ['src', 'types', 'rs']);
    const files = await fs.readdir(['src', 'types', 'rs']);
    const index = [];
    for (let i = 0; i < files.length; i++) {
        const fileName = files[i]
        index.push(`export * from './${fileName.replace('.ts', '')}';`);
    }
    await fs.save(['src', 'types', 'rs', 'index.ts'], index.join('\n'));
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
