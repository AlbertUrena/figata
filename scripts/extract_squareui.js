const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  await cdp.send('Runtime.enable');

  const requests = [];
  page.on('response', async (resp) => {
    try {
      const url = resp.url();
      if (/\.mp4(\?|$)/i.test(url) || (resp.request().resourceType() === 'media')) {
        const headers = await resp.allHeaders();
        requests.push({
          url,
          status: resp.status(),
          headers,
          requestHeaders: resp.request().headers(),
          resourceType: resp.request().resourceType(),
        });
      }
    } catch {}
  });

  await page.goto('https://squareui.com/', { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(3000);

  // Ensure fully loaded and root exists
  const hasRoot = await page.$('div.framer-w4se03-container');
  if (!hasRoot) throw new Error('No se encontró .framer-w4se03-container');

  await page.evaluate(() => {
    const root = document.querySelector('div.framer-w4se03-container');
    root.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);

  const deliverableA = await page.evaluate(() => {
    const root = document.querySelector('div.framer-w4se03-container');
    const r = root.getBoundingClientRect();

    function domPath(el) {
      const parts = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && parts.length < 10) {
        const tag = cur.tagName.toLowerCase();
        const cls = (cur.className || '').toString().trim().split(/\s+/).filter(Boolean);
        const id = cur.id ? `#${cur.id}` : '';
        const classPart = cls.length ? '.' + cls.slice(0, 3).join('.') : '';
        parts.unshift(`${tag}${id}${classPart}`);
        cur = cur.parentElement;
      }
      return parts.join(' > ');
    }

    return {
      exists: !!root,
      boundingClientRect: {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
        left: r.left,
      },
      domPath: domPath(root),
    };
  });

  const deliverableB = await page.evaluate(() => {
    const root = document.querySelector('div.framer-w4se03-container');
    const outerHTML = root.outerHTML;
    const subtree = root.cloneNode(true);
    subtree.querySelectorAll('script').forEach(s => s.remove());
    return {
      outerHTMLLength: outerHTML.length,
      outerHTML,
    };
  });

  const deliverableC = await page.evaluate(() => {
    function pick(el){
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        class: el.className,
        name: el.getAttribute('data-framer-name'),
        id: el.id || null,
        rect: { x:r.x, y:r.y, w:r.width, h:r.height },
        display: cs.display,
        position: cs.position,
        zIndex: cs.zIndex,
        box: {
          margin:[cs.marginTop,cs.marginRight,cs.marginBottom,cs.marginLeft],
          padding:[cs.paddingTop,cs.paddingRight,cs.paddingBottom,cs.paddingLeft],
          borderRadius: cs.borderRadius,
          border: {
            top:[cs.borderTopWidth,cs.borderTopStyle,cs.borderTopColor],
            right:[cs.borderRightWidth,cs.borderRightStyle,cs.borderRightColor],
            bottom:[cs.borderBottomWidth,cs.borderBottomStyle,cs.borderBottomColor],
            left:[cs.borderLeftWidth,cs.borderLeftStyle,cs.borderLeftColor],
          }
        },
        flex: cs.display.includes('flex') ? {
          flexDirection: cs.flexDirection,
          alignItems: cs.alignItems,
          justifyContent: cs.justifyContent,
          gap: cs.gap,
          rowGap: cs.rowGap,
          columnGap: cs.columnGap,
          flexWrap: cs.flexWrap,
        } : null,
        grid: cs.display.includes('grid') ? {
          gridTemplateColumns: cs.gridTemplateColumns,
          gridTemplateRows: cs.gridTemplateRows,
          gap: cs.gap,
        } : null,
        typography: {
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          color: cs.color,
          textAlign: cs.textAlign,
        },
        visual: {
          backgroundColor: cs.backgroundColor,
          backgroundImage: cs.backgroundImage,
          boxShadow: cs.boxShadow,
          opacity: cs.opacity,
          transform: cs.transform,
          transformOrigin: cs.transformOrigin,
          filter: cs.filter,
        }
      };
    }

    const root = document.querySelector('div.framer-w4se03-container');

    const targets = {
      root,
      tabs: root.querySelector('[data-framer-name="Tabs"]'),
      tabsActivePill: root.querySelector('.framer-cr6xz3[data-framer-name="Active"]'),
      tab1Container: root.querySelector('.framer-1vlgokz-container'),
      tab2Container: root.querySelector('.framer-1e0ptxd-container'),
      tab3Container: root.querySelector('.framer-tln2ih-container'),
      tabActive: root.querySelector('[data-framer-name="Active"][tabindex="0"]'),
      tabDefaults: [...root.querySelectorAll('[data-framer-name="Default"][tabindex="0"]')],
      progressBars: [...root.querySelectorAll('[data-framer-name="progress Bar"]')],
      icons: [...root.querySelectorAll('[data-framer-name="Icon"]')],
      textContainers: [...root.querySelectorAll('[data-framer-name="Title"], [data-framer-name="Subtitle"], [data-framer-name="Text"]')],
      cardWrapper: root.querySelector('.framer-1ii267n'),
      heroCard: root.querySelector('.framer-1c3wfs5'),
      media: root.querySelector('.framer-f2rkgw'),
      video: root.querySelector('video')
    };

    const dump = {};
    for (const [k,v] of Object.entries(targets)){
      if (!v) { dump[k] = null; continue; }
      if (Array.isArray(v)) dump[k] = v.map(pick);
      else dump[k] = pick(v);
    }
    return dump;
  });

  // CDP helpers for matched CSS rules
  async function getNodeIdForSelector(selector) {
    const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
    const out = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    return out.nodeId || null;
  }

  async function styleTextFromStyle(style) {
    if (!style) return null;
    if (style.cssText) return style.cssText;
    if (style.cssProperties) {
      return style.cssProperties
        .filter(p => p.name && p.value)
        .map(p => `${p.name}: ${p.value};`)
        .join(' ');
    }
    return null;
  }

  async function getMatched(selector, label) {
    const nodeId = await getNodeIdForSelector(selector);
    if (!nodeId) return { label, selector, found: false };

    const matched = await cdp.send('CSS.getMatchedStylesForNode', { nodeId });

    const ruleMap = (matched.matchedCSSRules || []).map((m) => ({
      selectors: m.rule.selectorList ? m.rule.selectorList.selectors.map(s => s.text) : [],
      origin: m.rule.origin,
      styleSheetId: m.rule.styleSheetId || null,
      style: m.rule.style ? (m.rule.style.cssText || (m.rule.style.cssProperties || []).map(p => `${p.name}: ${p.value};`).join(' ')) : null,
      media: m.rule.media || null,
      containerQueries: m.rule.containerQueries || null,
      supports: m.rule.supports || null,
      layer: m.rule.layer || null,
    }));

    const inherited = [];
    for (const inh of (matched.inherited || [])) {
      inherited.push({
        inlineStyle: await styleTextFromStyle(inh.inlineStyle),
        matchedCSSRules: (inh.matchedCSSRules || []).map(m => ({
          selectors: m.rule.selectorList ? m.rule.selectorList.selectors.map(s => s.text) : [],
          origin: m.rule.origin,
          styleSheetId: m.rule.styleSheetId || null,
          style: m.rule.style ? (m.rule.style.cssText || (m.rule.style.cssProperties || []).map(p => `${p.name}: ${p.value};`).join(' ')) : null,
        })),
      });
    }

    const pseudo = (matched.pseudoElements || []).map(pe => ({
      pseudoType: pe.pseudoType,
      rules: (pe.matchedCSSRules || []).map(m => ({
        selectors: m.rule.selectorList ? m.rule.selectorList.selectors.map(s => s.text) : [],
        origin: m.rule.origin,
        styleSheetId: m.rule.styleSheetId || null,
        style: m.rule.style ? (m.rule.style.cssText || (m.rule.style.cssProperties || []).map(p => `${p.name}: ${p.value};`).join(' ')) : null,
      })),
    }));

    return {
      label,
      selector,
      found: true,
      inlineStyle: await styleTextFromStyle(matched.inlineStyle),
      attributesStyle: await styleTextFromStyle(matched.attributesStyle),
      matchedRules: ruleMap,
      inherited,
      pseudo,
    };
  }

  const dTargets = [
    { label: 'root', selector: 'div.framer-w4se03-container' },
    { label: 'tabs', selector: 'div.framer-w4se03-container .framer-1uq2a91' },
    { label: 'activePill', selector: 'div.framer-w4se03-container .framer-cr6xz3[data-framer-name="Active"]' },
    { label: 'tabActive', selector: 'div.framer-w4se03-container [data-framer-name="Active"][tabindex="0"]' },
    { label: 'tabDefault', selector: 'div.framer-w4se03-container [data-framer-name="Default"][tabindex="0"]' },
    { label: 'progressBar', selector: 'div.framer-w4se03-container .framer-1eob78v, div.framer-w4se03-container [data-framer-name="progress Bar"]' },
    { label: 'icon', selector: 'div.framer-w4se03-container .framer-vg098r, div.framer-w4se03-container [data-framer-name="Icon"]' },
    { label: 'cardWrapper', selector: 'div.framer-w4se03-container .framer-1ii267n' },
    { label: 'heroCard', selector: 'div.framer-w4se03-container .framer-1c3wfs5' },
    { label: 'media', selector: 'div.framer-w4se03-container .framer-f2rkgw' },
    { label: 'video', selector: 'div.framer-w4se03-container video' },
  ];

  const deliverableD = [];
  for (const t of dTargets) {
    // handle comma selectors by trying first that exists
    const candidates = t.selector.split(',').map(s => s.trim());
    let res = null;
    for (const c of candidates) {
      res = await getMatched(c, t.label);
      if (res.found) break;
    }
    deliverableD.push(res);
  }

  const deliverableE = await page.evaluate(() => {
    const root = document.querySelector('div.framer-w4se03-container');
    const all = new Set();
    root.querySelectorAll('*').forEach(el=>{
      [...el.attributes].forEach(a=>{
        if (a.value && a.value.includes('--token-')) {
          const matches = a.value.match(/--token-[a-z0-9-]+/g);
          if (matches) matches.forEach(m=>all.add(m));
        }
      });
    });

    const tokens = [...all];
    function resolveVar(el, varName){
      return getComputedStyle(el).getPropertyValue(varName).trim() || null;
    }

    const resolved = {};
    tokens.forEach(t=>{
      const rootVal = resolveVar(document.documentElement, t);
      const sectionVal = resolveVar(root, t);
      resolved[t] = {
        root: rootVal,
        section: sectionVal,
        final: sectionVal || rootVal || null,
      };
    });
    return { tokenCount: tokens.length, tokens, resolved };
  });

  const deliverableF_61 = await page.evaluate(() => {
    function motionProps(el){
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        transitionProperty: cs.transitionProperty,
        transitionDuration: cs.transitionDuration,
        transitionTimingFunction: cs.transitionTimingFunction,
        transitionDelay: cs.transitionDelay,
        animationName: cs.animationName,
        animationDuration: cs.animationDuration,
        animationTimingFunction: cs.animationTimingFunction,
        animationDelay: cs.animationDelay,
        willChange: cs.willChange,
        transform: cs.transform,
        opacity: cs.opacity
      };
    }

    const root = document.querySelector('div.framer-w4se03-container');
    const activePill = root.querySelector('.framer-cr6xz3[data-framer-name="Active"]');
    const activeTab = root.querySelector('[data-framer-name="Active"][tabindex="0"]');
    const defaultTabs = [...root.querySelectorAll('[data-framer-name="Default"][tabindex="0"]')];
    const progressBars = [...root.querySelectorAll('[data-framer-name="progress Bar"]')];

    return {
      activePill: motionProps(activePill),
      activeTab: motionProps(activeTab),
      defaultTabs: defaultTabs.map(motionProps),
      progressBars: progressBars.map(motionProps),
    };
  });

  // Snap function
  async function snap(label) {
    return await page.evaluate((label) => {
      function doSnap(){
        const root = document.querySelector('div.framer-w4se03-container');
        const activePill = root.querySelector('.framer-cr6xz3[data-framer-name="Active"]');
        const tabs = [...root.querySelectorAll('[tabindex="0"][data-framer-name]')];
        const pillRect = activePill.getBoundingClientRect();
        return {
          label,
          time: performance.now(),
          activePill: {
            rect: {x:pillRect.x,y:pillRect.y,w:pillRect.width,h:pillRect.height},
            transform: getComputedStyle(activePill).transform,
          },
          tabs: tabs.map(t=>{
            const r=t.getBoundingClientRect();
            return {
              name: t.getAttribute('data-framer-name'),
              class: t.className,
              rect:{x:r.x,y:r.y,w:r.width,h:r.height},
              bg:getComputedStyle(t).backgroundColor,
              boxShadow:getComputedStyle(t).boxShadow,
              color:getComputedStyle(t).color,
              transform:getComputedStyle(t).transform,
              ariaSelected: t.getAttribute('aria-selected'),
            };
          })
        };
      }
      return doSnap();
    }, label);
  }

  const tab1 = page.locator('div.framer-w4se03-container .framer-1vlgokz-container [tabindex="0"][data-framer-name]').first();
  const tab2 = page.locator('div.framer-w4se03-container .framer-1e0ptxd-container [tabindex="0"][data-framer-name]').first();
  const tab3 = page.locator('div.framer-w4se03-container .framer-tln2ih-container [tabindex="0"][data-framer-name]').first();
  if (!(await tab1.count()) || !(await tab2.count()) || !(await tab3.count())) {
    throw new Error('No se detectaron los 3 tabs por contenedor esperado');
  }

  const deliverableF_62 = [];
  deliverableF_62.push(await snap('initial_before_click'));

  for (const [label, tab] of [['tab_2', tab2], ['tab_3', tab3], ['tab_1', tab1]]) {
    await tab.click();
    deliverableF_62.push(await snap(`${label}_immediate_after_click`));
    await page.waitForTimeout(300);
    deliverableF_62.push(await snap(`${label}_after_300ms`));
  }

  // Event listeners via CDP
  async function getEventListeners(selector) {
    const evalRes = await cdp.send('Runtime.evaluate', {
      expression: `(() => document.querySelector(${JSON.stringify(selector)}))()`,
      objectGroup: 'listeners',
      includeCommandLineAPI: false,
      returnByValue: false,
    });

    if (!evalRes.result || !evalRes.result.objectId) {
      return { selector, found: false, listeners: [] };
    }

    const out = await cdp.send('DOMDebugger.getEventListeners', {
      objectId: evalRes.result.objectId,
      depth: -1,
      pierce: true,
    });

    return {
      selector,
      found: true,
      listeners: (out.listeners || []).map(l => ({
        type: l.type,
        useCapture: l.useCapture,
        passive: l.passive,
        once: l.once,
        scriptId: l.scriptId,
        lineNumber: l.lineNumber,
        columnNumber: l.columnNumber,
        handler: l.handler ? {
          className: l.handler.className,
          description: l.handler.description,
          type: l.handler.type,
        } : null,
        originalHandler: l.originalHandler ? {
          className: l.originalHandler.className,
          description: l.originalHandler.description,
          type: l.originalHandler.type,
        } : null,
      })),
    };
  }

  const deliverableF_63 = {
    tabButton: await getEventListeners('div.framer-w4se03-container [tabindex="0"][data-framer-name]'),
    activePill: await getEventListeners('div.framer-w4se03-container .framer-cr6xz3[data-framer-name="Active"]'),
  };

  const deliverableF_64 = await page.evaluate(() => {
    const root = document.querySelector('div.framer-w4se03-container');
    const anims = root.getAnimations({subtree:true}).map(a=>({
      playState: a.playState,
      currentTime: a.currentTime,
      effect: a.effect && a.effect.getTiming ? a.effect.getTiming() : null
    }));
    return anims;
  });

  // Deliverable G: normal/hover/focus/active
  const gSelector = 'div.framer-w4se03-container [tabindex="0"][data-framer-name]';
  const gTab = page.locator(gSelector).first();
  const gProgress = page.locator('div.framer-w4se03-container [data-framer-name="progress Bar"]').first();
  const gIcon = page.locator('div.framer-w4se03-container [data-framer-name="Icon"]').first();

  async function stateSnapshot(stateLabel) {
    return await page.evaluate(({ tabSel }) => {
      const tab = document.querySelector(tabSel);
      const root = document.querySelector('div.framer-w4se03-container');
      const container = tab.closest('.framer-1vlgokz-container, .framer-1e0ptxd-container, .framer-tln2ih-container') || tab.parentElement;
      const progress = container ? container.querySelector('[data-framer-name="progress Bar"]') : root.querySelector('[data-framer-name="progress Bar"]');
      const icon = container ? container.querySelector('[data-framer-name="Icon"]') : root.querySelector('[data-framer-name="Icon"]');

      const cTab = getComputedStyle(tab);
      const cProg = progress ? getComputedStyle(progress) : null;
      const cIcon = icon ? getComputedStyle(icon) : null;

      return {
        tab: {
          backgroundColor: cTab.backgroundColor,
          boxShadow: cTab.boxShadow,
          borderRadius: cTab.borderRadius,
          transform: cTab.transform,
          opacity: cTab.opacity,
        },
        progressBar: cProg ? {
          backgroundColor: cProg.backgroundColor,
          boxShadow: cProg.boxShadow,
          borderRadius: cProg.borderRadius,
          transform: cProg.transform,
          opacity: cProg.opacity,
          width: cProg.width,
        } : null,
        icon: cIcon ? {
          backgroundColor: cIcon.backgroundColor,
          boxShadow: cIcon.boxShadow,
          borderRadius: cIcon.borderRadius,
          transform: cIcon.transform,
          opacity: cIcon.opacity,
        } : null,
      };
    }, { tabSel: gSelector });
  }

  const deliverableG = {};
  deliverableG.normal = await stateSnapshot('normal');

  await gTab.hover();
  await page.waitForTimeout(100);
  deliverableG.hover = await stateSnapshot('hover');

  await gTab.focus();
  await page.waitForTimeout(100);
  deliverableG.focus = await stateSnapshot('focus');

  const box = await gTab.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    deliverableG.active = await stateSnapshot('active');
    await page.mouse.up();
  } else {
    deliverableG.active = null;
  }

  // Deliverable H
  const deliverableH = await page.evaluate(() => {
    const v = document.querySelector('div.framer-w4se03-container video');
    if (!v) return null;
    return {
      src: v.currentSrc || v.src,
      autoplay: v.autoplay,
      loop: v.loop,
      muted: v.muted,
      playsInline: v.playsInline,
      preload: v.preload,
      controls: v.controls,
      poster: v.poster || null,
      readyState: v.readyState,
      networkState: v.networkState,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      style: {
        objectFit: getComputedStyle(v).objectFit,
        objectPosition: getComputedStyle(v).objectPosition,
        borderRadius: getComputedStyle(v).borderRadius
      },
      containerRect: (() => {
        const wr = v.closest('.framer-f2rkgw') || v.parentElement;
        if (!wr) return null;
        const r = wr.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      })(),
      playbackInfo: {
        paused: v.paused,
        ended: v.ended,
        currentTime: v.currentTime,
        duration: v.duration,
      },
    };
  });

  // Try detect js controlling playback by listening method wrapping quick check
  const playbackHooks = {
    note: 'No reliable in-page API for listener source without DevTools Event Listeners; see Deliverable F event listeners.',
  };

  const output = {
    deliverableA,
    deliverableB,
    deliverableC,
    deliverableD,
    deliverableE,
    deliverableF: {
      section_61: deliverableF_61,
      section_62: deliverableF_62,
      section_63: deliverableF_63,
      section_64: deliverableF_64,
    },
    deliverableG,
    deliverableH: {
      video: deliverableH,
      networkMediaRequests: requests,
      playbackHooks,
    },
    meta: {
      url: page.url(),
      viewport: page.viewportSize(),
      deviceScaleFactor: 1,
      zoom: '100% (default headless context)',
      cacheDisabled: true,
      preserveLog: true,
      generatedAt: new Date().toISOString(),
    }
  };

  fs.writeFileSync('/Users/al/website-figata/squareui_extract.json', JSON.stringify(output, null, 2));
  console.log('WROTE /Users/al/website-figata/squareui_extract.json');

  await browser.close();
})();
