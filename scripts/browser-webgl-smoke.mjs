import { chromium } from 'playwright';
import fs from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const output = path.resolve('test-artifacts/front-operation-browser');
fs.mkdirSync(output, { recursive: true });
const errors = [];
const events = [];
const results = [];
const html = fs.readFileSync('index.html');
const server = createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
    res.end(html);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
let browser;
let page;

async function test(label, fn) {
  const start = Date.now();
  try {
    const details = await fn();
    results.push({ test: label, status: 'PASS', durationMs: Date.now() - start, details: details ?? null });
    console.log('PASS ' + label + (details ? ': ' + JSON.stringify(details) : ''));
  } catch (error) {
    results.push({ test: label, status: 'FAIL', durationMs: Date.now() - start, error: String(error) });
    console.error('FAIL ' + label + ': ' + String(error));
    try {
      if (page && !page.isClosed()) {
        await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true, timeout: 10000 });
      }
    } catch (ignored) {}
    throw error;
  }
}

async function screenshot(name) {
  await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true, animations: 'disabled' });
}
async function changeClass(role) {
  await page.keyboard.press('b');
  await page.waitForFunction(() => !document.getElementById('menu-overlay').classList.contains('hidden'));
  await page.evaluate(() => { if (document.pointerLockElement) document.exitPointerLock(); });
  await page.locator('.class-card[data-class="' + role + '"]').click();
  await page.locator('#btn-deploy').click();
  await page.waitForFunction(() => document.getElementById('menu-overlay').classList.contains('hidden'));
}

try {
  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--enable-webgl',
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--use-angle=swiftshader'
    ]
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce'
  });
  page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', msg => { if (msg.type() === 'error') events.push(msg.text()); });
  page.on('requestfailed', request => {
    if (/three\.min\.js|tailwindcss\.com/.test(request.url())) errors.push('Required asset failed: ' + request.url());
  });

  await test('real Chromium WebGL boot and menu', async () => {
    await page.goto('http://127.0.0.1:' + port + '/', { waitUntil: 'load', timeout: 80000 });
    await page.waitForFunction(
      () => window.THREE && document.querySelector('#menu-overlay') &&
        document.querySelector('#game-canvas').width > 0,
      { timeout: 60000 }
    );
    const state = await page.evaluate(() => ({
      title: document.title,
      menuText: document.getElementById('menu-title').textContent.trim(),
      classes: document.querySelectorAll('.class-card').length,
      canvasWidth: document.getElementById('game-canvas').width,
      canvasHeight: document.getElementById('game-canvas').height,
      webgl2: !!document.getElementById('game-canvas').getContext('webgl2'),
      webgl1: !!document.getElementById('game-canvas').getContext('webgl')
    }));
    if (state.classes !== 5 || !state.title.includes('FRONT OPERATION') || !state.menuText.includes('SINIF')) throw Error('Menu, class tabs or game branding missing');
    if (!state.webgl1 && !state.webgl2) throw Error('No active WebGL rendering context');
    await screenshot('01-menu');
    return state;
  });

  await test('start match and verify 6v6 scoreboard', async () => {
    await page.locator('#btn-deploy').click({ timeout: 15000 });
    await page.waitForFunction(() => document.getElementById('menu-overlay').classList.contains('hidden'));
    await page.keyboard.down('w');
    await delay(650);
    await page.keyboard.up('w');
    await page.keyboard.press('q');
    await page.keyboard.press('e');
    await page.keyboard.press('Tab');
    const blueCount = await page.locator('#sb-blue-list > div').count();
    const redCount = await page.locator('#sb-red-list > div').count();
    await page.keyboard.up('Tab');
    await screenshot('02-match');
    if (blueCount !== 6 || redCount !== 6) throw Error('Expected 6v6, saw ' + blueCount + ':' + redCount);
    return { blueCount, redCount, timer: await page.locator('#match-timer').textContent() };
  });

  await test('V38 live squad roles and V35 bot distribution', async () => {
    const state = await page.evaluate(() => window.__frontOperationAiQaSnapshot?.());
    if (!state) throw Error('Local Chromium AI test snapshot missing');
    const blue = state.members.filter(b => b.team === 'blue');
    const red = state.members.filter(b => b.team === 'red');
    const number = (a, key, value) => a.filter(b => b[key] === value).length;
    if (!state.started || blue.length !== 5 || red.length !== 6) {
      throw Error('Live game is not a 5-bot plus 6-bot match');
    }
    const roles = ['FLANK', 'PIN', 'SUPPORT', 'OVERWATCH', 'RECON'];
    if (roles.some(role => number(blue, 'role', role) !== 1) ||
        number(red, 'role', 'FLANK') !== 1 ||
        number(red, 'role', 'POINT') !== 1) {
      throw Error('Live team tactics did not allocate coordinated roles');
    }
    if (number(blue, 'difficulty', 'normal') !== 3 ||
        number(blue, 'difficulty', 'hard') !== 2 ||
        number(red.slice(0, 5), 'difficulty', 'normal') !== 3 ||
        number(red.slice(0, 5), 'difficulty', 'hard') !== 2) {
      throw Error('Approved V35 bot difficulty ratio changed');
    }
    if (!state.tacticTeams.includes('blue') || !state.tacticTeams.includes('red')) {
      throw Error('V38 team tactical memory was not initialized');
    }
    return {
      blueRoles: blue.map(b => b.role),
      redRoles: red.map(b => b.role),
      blueDifficulties: blue.map(b => b.difficulty)
    };
  });

  await test('V39 real player gunfire creates acoustic cue', async () => {
    await page.mouse.move(700, 440);
    // First click may acquire pointer lock. A held follow-up click
    // spans game animation frames and confirms actual firing input.
    await page.mouse.click(700, 440, { button: 'left' });
    await page.mouse.down({ button: 'left' });
    await delay(280);
    await page.mouse.up({ button: 'left' });
    await delay(100);
    const state = await page.evaluate(() => window.__frontOperationAiQaSnapshot?.());
    if (!state) throw Error('Local V39 acoustic QA snapshot missing');
    const sounds = state.soundEvents.filter(e =>
      e.sourceId === 'player' && e.team === 'blue' &&
      ['gun', 'sniper', 'pistol'].includes(e.kind) &&
      e.age >= 0 && e.age < 1.4
    );
    if (!sounds.length) {
      throw Error('Player gunfire failed to emit a V39 acoustic event');
    }
    return { events: sounds.length, kinds: sounds.map(e => e.kind) };
  });

  await test('V40 real 6v6 bot metrics integrity', async () => {
    // Headless software WebGL varies strongly in frame throughput.
    // Wait for actual AI samples instead of assuming wall-clock 1.25s.
    await page.waitForFunction(() => {
      const stats = window.__frontOperationAiQaSnapshot?.()?.botMetrics;
      return stats && stats.samples >= 1 && stats.frame.count >= 2 &&
        stats.spread.blue.observations >= 1 &&
        stats.spread.red.observations >= 1;
    }, null, { timeout: 25000 });
    const stats = await page.evaluate(() =>
      window.__frontOperationAiQaSnapshot?.()?.botMetrics);
    if (!stats) throw Error('V40 live telemetry snapshot missing');
    if (stats.version !== 40 || stats.samples < 1 ||
        stats.teams.blue.spawns !== 5 || stats.teams.red.spawns !== 6) {
      throw Error('V40 match counters did not initialize correctly: ' +
        JSON.stringify(stats).slice(0, 800));
    }
    const totalShots = Object.values(stats.difficulty)
      .reduce((sum, row) => sum + row.shots, 0);
    const totalHits = Object.values(stats.difficulty)
      .reduce((sum, row) => sum + row.hits, 0);
    if (totalHits > totalShots || stats.recent.length > 20 ||
        !Number.isFinite(stats.spread.blue.meanRadius) ||
        !Number.isFinite(stats.spread.red.meanRadius) ||
        stats.frame.count < 2 ||
        !Number.isFinite(stats.frame.fps) ||
        stats.frame.fps <= 0) {
      throw Error('V40 live team distribution or hit accounting invalid: ' +
        JSON.stringify({samples:stats.samples,frame:stats.frame,
          spread:stats.spread,hits:totalHits,shots:totalShots}));
    }
    return {
      simulatedSeconds: stats.seconds,
      botSamples: stats.samples,
      blueRadius: stats.spread.blue.meanRadius,
      redRadius: stats.spread.red.meanRadius,
      shots: totalShots, hits: totalHits,
      measuredFps: stats.frame.fps,
      slowFramePercent: stats.frame.slowPercent,
      byDifficulty: Object.fromEntries(Object.entries(stats.difficulty)
        .map(([key, value]) =>
          [key, { shots: value.shots, hits: value.hits, accuracy: value.accuracy }]))
    };
  });

  await test('sniper class and MRAD scope', async () => {
    await changeClass('sniper');
    await page.mouse.click(700, 440, { button: 'right' });
    await delay(300);
    const scope = await page.locator('#sniper-scope').evaluate(el => getComputedStyle(el).display);
    await screenshot('03-sniper');
    if (scope === 'none') throw Error('MRAD scope overlay not shown on ADS');
    return { scopeDisplay: scope };
  });

  await test('FPV drone deployment HUD and recall', async () => {
    await changeClass('engineer');
    await page.keyboard.press('4');
    await delay(200);
    await page.mouse.click(700, 440, { button: 'left' });
    await page.waitForFunction(() => getComputedStyle(document.getElementById('drone-hud')).display !== 'none', { timeout: 4500 });
    const droneMode = await page.locator('#drone-mode-badge').textContent();
    await screenshot('04-drone');
    await page.keyboard.press('r');
    await page.waitForFunction(() => getComputedStyle(document.getElementById('drone-hud')).display === 'none', { timeout: 5000 });
    return { droneMode: droneMode.trim(), recalled: true };
  });

  await test('no uncaught game errors', async () => {
    const gameErrors = errors.filter(line => !/ResizeObserver loop/.test(line));
    if (gameErrors.length) throw Error(gameErrors.join(' | ').slice(0, 1500));
    return { pageErrors: gameErrors.length, browserConsoleErrorCount: events.length };
  });
} catch (error) {
  process.exitCode = 1;
  console.error('BROWSER QA FAILED: ' + String(error));
} finally {
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({
    version: 'FRONT OPERATION V25 + V11 approved model details',
    browser: 'Chromium headless / software WebGL',
    results, pageErrors: errors, consoleErrors: events
  }, null, 2));
  try { await browser?.close(); } catch (ignored) {}
  await new Promise(resolve => server.close(resolve));
}
