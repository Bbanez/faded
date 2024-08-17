import { callAndClearUnsubscribeFns, UnsubscribeFns } from '@fdd/util/sub.ts';
import { Ticker } from './ticker.ts';
import { createLinear2D } from '@fdd/util/math.ts';

export class FPS {
    private unsubs: UnsubscribeFns = [];

    fpsCount = 0;
    fpsEl: HTMLDivElement;
    elements: HTMLDivElement[] = [];
    data: number[] = [];
    container: HTMLDivElement;
    fpsToColor = createLinear2D([0, 0xff0000], [60, 0xffff00]);

    constructor() {
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.top = '0px';
        this.container.style.right = '0px';
        this.container.style.display = 'flex';
        this.container.style.flex = 'column';
        this.container.style.height = '40px';
        this.container.style.width = '60px';
        this.fpsEl = document.createElement('div');
        this.fpsEl.style.position = 'absolute';
        this.fpsEl.style.fontSize = '8px';
        this.fpsEl.style.lineHeight = '8px';
        this.fpsEl.style.top = '0px';
        this.fpsEl.style.right = '0px';
        this.fpsEl.style.padding = '1px';
        this.fpsEl.style.width = '100%';
        this.fpsEl.style.textAlign = 'right';
        this.fpsEl.style.color = '#ffffff';
        this.fpsEl.style.backgroundColor = 'rgba(0,0,0,0.2)';
        this.fpsEl.innerText = '0';
        this.container.appendChild(this.fpsEl);
        const elementsContainer = document.createElement('div');
        elementsContainer.style.position = 'absolute';
        elementsContainer.style.bottom = '0px';
        elementsContainer.style.left = '0px';
        elementsContainer.style.display = 'flex';
        elementsContainer.style.height = '30px';
        elementsContainer.style.width = '60px';
        this.container.appendChild(elementsContainer);
        for (let i = 0; i < 20; i++) {
            this.data.push(i);
            const el = document.createElement('div');
            el.style.height = `${(i * 100) / 60}%`;
            el.style.width = `3px`;
            el.style.bottom = '0px';
            el.style.backgroundColor = `#${this.fpsToColor.call(i).toString(16)}`;
            this.elements.push(el);
            elementsContainer.appendChild(el);
        }
        const interval = setInterval(() => {
            this.data.splice(0, 1);
            this.data.push(this.fpsCount);
            this.fpsEl.innerText = `${this.fpsCount} fps`;
            this.fpsCount = 0;
            for (let i = 0; i < this.data.length; i++) {
                this.elements[i].style.height = `${(this.data[i] * 100) / 60}%`;
                let color = this.fpsToColor.call(this.data[i]).toString(16);
                if (color.length < 6) {
                    const lan = color.length;
                    for (let j = lan; j < 6; j++) {
                        color += '0';
                    }
                }
                this.elements[i].style.backgroundColor = `#${color}`;
            }
        }, 1000);
        this.unsubs.push(
            Ticker.subscribe(async () => {
                this.fpsCount++;
            }),
            () => {
                clearInterval(interval);
            },
        );
        document.body.appendChild(this.container);
    }

    destroy() {
        callAndClearUnsubscribeFns(this.unsubs);
        document.body.removeChild(this.container);
    }
}
