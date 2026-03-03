const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  await cdp.send('DOM.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOMDebugger.enable').catch(() => {});

  await page.goto('https://squareui.com/', { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(2000);

  const prep = await page.evaluate(() => {
    const root = document.querySelector('div.framer-w4se03-container');
    if (!root) return { ok: false, error: 'root not found' };
    root.scrollIntoView({ block: 'center' });

    const tabsWrap = root.querySelector('[data-framer-name="Tabs"]');
    const pill = root.querySelector('.framer-cr6xz3[data-framer-name="Active"]');
    const tabButtons = [...root.querySelectorAll('.framer-oVrna.framer-11tu8si[tabindex="0"]')];
    const progressBars = tabButtons.map(b => b.querySelector('.framer-1eob78v[data-framer-name="progress Bar"]'));
    const media = root.querySelector('.framer-f2rkgw[data-framer-name="Media"]');
    const video = media ? media.querySelector('video') : null;

    return {
      ok: true,
      refs: {
        root: !!root,
        tabsWrap: !!tabsWrap,
        pill: !!pill,
        tabButtons: tabButtons.length,
        progressBars: progressBars.filter(Boolean).length,
        media: !!media,
        video: !!video,
      }
    };
  });

  if (!prep.ok) throw new Error(prep.error || 'prep failed');

  await page.waitForTimeout(500);

  const sectionB = await page.evaluate(async () => {
    const root = document.querySelector('div.framer-w4se03-container');
    const pill = root.querySelector('.framer-cr6xz3[data-framer-name="Active"]');
    const tabButtons = [...root.querySelectorAll('.framer-oVrna.framer-11tu8si[tabindex="0"]')];

    function snapRect(el){
      const r = el.getBoundingClientRect();
      return {x:r.x, y:r.y, w:r.width, h:r.height};
    }

    function sampleFor(ms=1200){
      const t0 = performance.now();
      const frames = [];
      return new Promise(resolve=>{
        function frame(){
          const t = performance.now();
          frames.push({
            t: +(t - t0).toFixed(2),
            pillRect: snapRect(pill),
            pillTransform: getComputedStyle(pill).transform,
            pillBoxShadow: getComputedStyle(pill).boxShadow,
            tabRects: tabButtons.map((b,i)=>({i, rect:snapRect(b)}))
          });
          if (t - t0 >= ms) return resolve(frames);
          requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }

    async function clickAndSample(idx){
      tabButtons[idx].click();
      return await sampleFor(1400);
    }

    const s1 = await clickAndSample(1);
    const s2 = await clickAndSample(2);
    const s3 = await clickAndSample(0);

    return {
      frameCounts: { s1: s1.length, s2: s2.length, s3: s3.length },
      s1,
      s2,
      s3
    };
  });

  const sectionC = await page.evaluate(async () => {
    const root = document.querySelector('div.framer-w4se03-container');
    const pill = root.querySelector('.framer-cr6xz3[data-framer-name="Active"]');
    const tabButtons = [...root.querySelectorAll('.framer-oVrna.framer-11tu8si[tabindex="0"]')];
    const progressBars = tabButtons.map(b => b.querySelector('.framer-1eob78v[data-framer-name="progress Bar"]'));
    const media = root.querySelector('.framer-f2rkgw[data-framer-name="Media"]');

    function width(el){ return el ? el.getBoundingClientRect().width : null; }
    function guessActiveIndex(){
      const pr = pill.getBoundingClientRect();
      const pc = pr.x + pr.width/2;
      let best = {i:null, d:Infinity};
      tabButtons.forEach((b,i)=>{
        const r = b.getBoundingClientRect();
        const c = r.x + r.width/2;
        const d = Math.abs(pc - c);
        if (d < best.d) best = {i,d};
      });
      return best.i;
    }

    async function sampleAutoplay(totalMs=15000, stepMs=100){
      const t0 = performance.now();
      const out = [];
      while (performance.now() - t0 < totalMs){
        const v = media?.querySelector('video') || null;
        out.push({
          t:+(performance.now()-t0).toFixed(0),
          activeIndex: guessActiveIndex(),
          progressWidths: progressBars.map(width),
          pillTransform: getComputedStyle(pill).transform,
          videoSrc: v?.currentSrc || v?.getAttribute('src') || null,
          videoConnected: v ? v.isConnected : null
        });
        await new Promise(r=>setTimeout(r, stepMs));
      }
      return out;
    }

    return await sampleAutoplay();
  });

  const sectionD = await page.evaluate(async () => {
    const root = document.querySelector('div.framer-w4se03-container');
    const tabButtons = [...root.querySelectorAll('.framer-oVrna.framer-11tu8si[tabindex="0"]')];
    const cardWrap = root.querySelector('.framer-1ii267n');
    const media = root.querySelector('.framer-f2rkgw[data-framer-name="Media"]');

    function subtree(){
      return {
        cardWrap: cardWrap ? cardWrap.outerHTML : null,
        media: media ? media.outerHTML : null
      };
    }
    async function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

    const a = subtree();
    tabButtons[1].click(); await wait(600);
    const b = subtree();
    tabButtons[2].click(); await wait(600);
    const c = subtree();

    return { a, b, c };
  });

  async function getListenersForSelector(selector) {
    const evalRes = await cdp.send('Runtime.evaluate', {
      expression: `(() => document.querySelector(${JSON.stringify(selector)}))()`,
      returnByValue: false,
      includeCommandLineAPI: false,
      objectGroup: 'listeners'
    });

    if (!evalRes?.result?.objectId) return { found: false, raw: [] };

    const res = await cdp.send('DOMDebugger.getEventListeners', {
      objectId: evalRes.result.objectId,
      depth: -1,
      pierce: true
    });

    return { found: true, raw: res.listeners || [] };
  }

  function groupListeners(raw, only = []) {
    const allow = new Set(only);
    const out = {};
    for (const l of raw) {
      if (allow.size && !allow.has(l.type)) continue;
      if (!out[l.type]) out[l.type] = [];
      out[l.type].push({
        useCapture: l.useCapture,
        passive: l.passive,
        once: l.once,
        scriptId: l.scriptId,
        lineNumber: l.lineNumber,
        columnNumber: l.columnNumber,
        handler: l.handler ? {
          type: l.handler.type,
          className: l.handler.className,
          description: l.handler.description,
        } : null,
        originalHandler: l.originalHandler ? {
          type: l.originalHandler.type,
          className: l.originalHandler.className,
          description: l.originalHandler.description,
        } : null,
      });
    }
    return out;
  }

  const listenerTypes = ['click', 'pointerdown', 'keydown', 'focus', 'mouseenter', 'mouseleave'];
  const tab0Sel = 'div.framer-w4se03-container .framer-oVrna.framer-11tu8si[tabindex="0"]';
  const tabsWrapSel = 'div.framer-w4se03-container [data-framer-name="Tabs"]';

  const tab0Ls = await getListenersForSelector(tab0Sel);
  const wrapLs = await getListenersForSelector(tabsWrapSel);

  const sectionE = {
    tabButton0: groupListeners(tab0Ls.raw, listenerTypes),
    tabsWrap: groupListeners(wrapLs.raw, listenerTypes),
    meta: {
      tabButton0Found: tab0Ls.found,
      tabsWrapFound: wrapLs.found,
    }
  };

  const output = {
    A: prep,
    B: sectionB,
    C: sectionC,
    D: sectionD,
    E: sectionE,
    meta: {
      url: page.url(),
      viewport: page.viewportSize(),
      generatedAt: new Date().toISOString(),
    }
  };

  const outPath = '/Users/al/website-figata/dynamic_probe.json';
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  fs.writeFileSync('/Users/al/website-figata/dynamic_probe_B.json', JSON.stringify(sectionB, null, 2));
  fs.writeFileSync('/Users/al/website-figata/dynamic_probe_C.json', JSON.stringify(sectionC, null, 2));
  fs.writeFileSync('/Users/al/website-figata/dynamic_probe_D.json', JSON.stringify(sectionD, null, 2));
  fs.writeFileSync('/Users/al/website-figata/dynamic_probe_E.json', JSON.stringify(sectionE, null, 2));

  console.log(outPath);
  await browser.close();
})();
