// turbo-renderer.js
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class TurboRenderer {
    constructor(opts = {}) {
        this.opts = Object.assign({
            htmlFile: path.resolve('./banner.html'),
            width: 700,
            height: 250,
            frames: 12,
            fps: 8,
            outFormat: 'gif',
            webpQuality: 80,
            webpPreset: 'default'
        }, opts);
        this.browser = null;
        this.page = null;
    }

    async init() {
        if (this.browser) return;
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--font-render-hinting=medium',
                '--enable-font-antialiasing',
                '--enable-remote-fonts'
            ]
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: this.opts.width, height: this.opts.height });

        await this.page.goto('file://' + this.opts.htmlFile, { waitUntil: 'networkidle0' });

        // inject TTF font at runtime
        try {
            const fontPath = path.resolve('./BungeeShade.ttf');
            if (fs.existsSync(fontPath)) {
                const fontB64 = fs.readFileSync(fontPath).toString('base64');
                await this.page.evaluate(async (b64) => {
                    const u8 = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
                    const font = new FontFace('BungeeShadeRuntime', u8, { style: 'normal', weight: '400' });
                    await font.load();
                    (document.fonts || window.fonts).add(font);
                    const el = document.getElementById('glitchText');
                    if (el) el.style.fontFamily = "'BungeeShadeRuntime', cursive";
                }, fontB64);
            } else {
                console.warn('TTF font not found at', fontPath);
            }
        } catch (e) {
            console.warn('Error injecting runtime font', e);
        }

        try { await this.page.evaluate(() => document.fonts && document.fonts.ready); } catch { }
    }

    async close() {
        if (this.page) await this.page.close().catch(() => { });
        if (this.browser) await this.browser.close().catch(() => { });
        this.page = null;
        this.browser = null;
    }

    async renderToBuffer(text) {
        if (!this.page) await this.init();
        const { frames, fps, outFormat } = this.opts;

        // set text
        await this.page.evaluate((t) => {
            if (window.setBannerText) return window.setBannerText(t);
            const el = document.getElementById('glitchText');
            if (el) { el.textContent = t; el.setAttribute('data-text', t); }
        }, text);

        // prepare ffmpeg
        let ffmpeg;
        if (outFormat === 'gif') {
            ffmpeg = spawn('ffmpeg', [
                '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', 'pipe:0',
                '-filter_complex', '[0:v]split[x][y];[x]palettegen=stats_mode=diff[pal];[y][pal]paletteuse=dither=bayer:bayer_scale=5',
                '-f', 'gif', 'pipe:1'
            ], { stdio: ['pipe', 'pipe', 'inherit'] });
        } else {
            ffmpeg = spawn('ffmpeg', [
                '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', 'pipe:0',
                '-vcodec', 'libwebp', '-lossless', '0', '-qscale', String(this.opts.webpQuality || 80),
                '-preset', String(this.opts.webpPreset || 'default'), '-loop', '0', 'pipe:1'
            ], { stdio: ['pipe', 'pipe', 'inherit'] });
        }

        const bufs = [];
        ffmpeg.stdout.on('data', (d) => bufs.push(d));

        // capture frames by stepping animation time
        for (let i = 0; i < frames; i++) {
            const t = (i / frames) * 11000; // 11s animation cycle
            await this.page.evaluate((ms) => {
                try {
                    if (document.timeline && document.timeline.currentTime !== undefined) {
                        document.timeline.currentTime = ms;
                    }
                } catch { }
            }, t);

            const shot = await this.page.screenshot({ type: 'png' });
            ffmpeg.stdin.write(shot);
        }
        ffmpeg.stdin.end();

        return new Promise((resolve, reject) => {
            ffmpeg.on('close', (code) => {
                if (code === 0) resolve(Buffer.concat(bufs));
                else reject(new Error('ffmpeg failed ' + code));
            });
        });
    }
}

module.exports = TurboRenderer;
