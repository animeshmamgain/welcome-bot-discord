// renderer/renderer-starter.js
// wrapper to manage a singleton turbo renderer and expose renderBuffer

const path = require('path');
const TurboRenderer = require('./turbo-renderer');

const renderer = new TurboRenderer({
    htmlFile: path.resolve(__dirname, './banner.html'),
    outFormat: 'gif',
    frames: 12,
    fps: 8
});

async function startRenderer() {
    try {
        await renderer.init();
        console.log('Renderer started');
    } catch (e) {
        console.error('Renderer start error', e);
    }
}

async function stopRenderer() {
    try {
        await renderer.close();
        console.log('Renderer stopped');
    } catch (e) {
        console.warn('Renderer stop error', e);
    }
}

async function renderBuffer(text) {
    return renderer.renderToBuffer(text);
}

module.exports = { startRenderer, stopRenderer, renderBuffer };
