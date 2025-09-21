// test-render.js
const path = require('path');
const fs = require('fs');
const { renderBuffer, startRenderer, stopRenderer } = require('./renderer/renderer-starter');

(async () => {
    try {
        await startRenderer();
        const buf = await renderBuffer('TestUser123');
        fs.writeFileSync('test_banner.gif', buf);
        console.log('Wrote test_banner.gif');
        await stopRenderer();
    } catch (e) {
        console.error('Test render error', e);
    }
})();
