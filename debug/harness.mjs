// debug/harness.mjs — Puppeteer test harness for cat-runner-game
// Run: node debug/harness.mjs

import puppeteer from 'puppeteer';

const URL = 'http://127.0.0.1:5500/index.html?debug=1';
const GROUND_Y = 240;
const TICKS_5S = 300;

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail: detail || (pass ? 'OK' : 'FAIL') });
  const icon = pass ? '✅' : '❌';
  console.log(`${icon} ${name}: ${detail || (pass ? 'OK' : 'FAIL')}`);
};

async function main() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__game && window.__game.snap);

  const snap  = () => page.evaluate(() => { window.__game.render(); return window.__game.snap(); });
  const input = (i) => page.evaluate((x) => window.__game.input(x), i);
  const tick  = (n) => page.evaluate((x) => { window.__game.tick(x); window.__game.render(); }, n);

  // Helper: start game and wait until PLAYING + onGround
  async function ensurePlaying(ticks = 60) {
    let s = await snap();
    if (s.state !== 'PLAYING') {
      await input('start');
      await tick(ticks);
      // Wait max 2s for state to become PLAYING
      for (let i = 0; i < 30; i++) {
        s = await snap();
        if (s.state === 'PLAYING' && s.onGround) break;
        await tick(5);
      }
    }
    return await snap();
  }

  // ══════════════════════════════════════
  // Bug 1: Spawn — obstacles appear
  // ══════════════════════════════════════
  await input('start');
  await tick(TICKS_5S);
  let s = await snap();
  check('bug1_spawn', s.obstacles.length > 0,
    `obstacles after ${TICKS_5S} ticks: ${s.obstacles.length}`);

  // ══════════════════════════════════════
  // Bug 2: Parallax — windowOffset changes
  // ══════════════════════════════════════
  let offset1 = s.windowOffset;
  await tick(200);
  s = await snap();
  let offset2 = s.windowOffset;
  check('bug2_parallax', Math.abs(offset2 - offset1) > 0.1,
    `windowOffset delta: ${(offset2 - offset1).toFixed(3)}`);

  // ══════════════════════════════════════
  // Bug 3: Pause — ESC toggles PAUSED, R restarts
  // ══════════════════════════════════════
  // Restart fresh to avoid game-over from bug1/2
  await input('restart');
  await ensurePlaying(60);
  s = await snap();
  check('bug3_precheck', s.state === 'PLAYING', `pre-pause state: ${s.state}`);

  await input('pause');
  s = await snap();
  check('bug3a_pause', s.state === 'PAUSED', `state: ${s.state}`);

  await input('pause'); // unpause
  s = await snap();
  check('bug3b_unpause', s.state === 'PLAYING', `state: ${s.state}`);

  await input('pause');
  await input('restart');
  s = await snap();
  check('bug3c_restart', s.state === 'READY' && s.score === 0,
    `state: ${s.state}, score: ${s.score}`);

  // ══════════════════════════════════════
  // Bug 4: Cat duplicate — only 1 cat-body when ducking
  // ══════════════════════════════════════
  s = await ensurePlaying(60);
  await input('duck');
  await tick(5);
  s = await snap();
  const bodyCount = s.drawLog.filter(d => d.part === 'cat-body').length;
  check('bug4_no_duplicate', bodyCount === 1,
    `cat-body entries: ${bodyCount} (expected 1, state: ${s.state}, ducking: ${s.ducking})`);

  // ══════════════════════════════════════
  // Bug 5: Duck complete — tail, ears, paws, nose, whiskers
  // ══════════════════════════════════════
  if (s.state === 'PLAYING') {
    const duckParts = s.drawLog.map(d => d.part);
    const requiredParts = ['cat-tail', 'cat-leg', 'cat-body', 'cat-head', 'cat-ear', 'cat-nose', 'cat-whisker'];
    const missing = requiredParts.filter(p => !duckParts.includes(p));
    check('bug5_duck_complete', missing.length === 0,
      missing.length > 0 ? `missing: ${missing.join(', ')}` : `all ${requiredParts.length} parts present`);
  } else {
    check('bug5_duck_complete', false, `state is ${s.state}, cannot test`);
  }

  // ══════════════════════════════════════
  // Bug 6: Dog — paws above ground, body bigger than cat
  // ══════════════════════════════════════
  await input('releaseDuck');
  await tick(10);
  s = await snap();

  // Dog legs above ground
  const dogLegs = s.drawLog.filter(d => d.part === 'dog-leg');
  let dogLegOK = true;
  let dogLegDetail = '';
  for (const leg of dogLegs) {
    const legBottom = leg.y + leg.h;
    if (legBottom > GROUND_Y + 2) {
      dogLegOK = false;
      dogLegDetail += `leg y=${leg.y.toFixed(1)} bottom=${legBottom.toFixed(1)} > ${GROUND_Y}; `;
    }
  }
  if (!dogLegDetail) dogLegDetail = `all ${dogLegs.length} legs OK`;
  check('bug6a_dog_legs_above_ground', dogLegOK, dogLegDetail);

  // Body ratio: dog 56×40 vs cat 36×32
  const dogBody = s.drawLog.find(d => d.part === 'dog-body');
  const catBody = s.drawLog.find(d => d.part === 'cat-body');
  let ratioOK = false;
  let ratioDetail = 'no bodies found';
  if (dogBody && catBody) {
    const dogArea = dogBody.w * dogBody.h;
    const catArea = catBody.w * catBody.h;
    ratioOK = dogArea > catArea * 1.3;
    ratioDetail = `dog: ${dogBody.w}×${dogBody.h}=${dogArea}, cat: ${catBody.w}×${catBody.h}=${catArea}, ratio: ${(dogArea/catArea).toFixed(2)}`;
  }
  check('bug6b_dog_bigger_than_cat', ratioOK, ratioDetail);

  // ══════════════════════════════════════
  // Bug 7: Jump hitbox — hitbox.y ≈ catY - 60
  // ══════════════════════════════════════
  await input('restart');
  s = await ensurePlaying(60);
  await input('jump');
  await tick(8);
  s = await snap();
  const expectedHbY = s.catY - 51; // friendly hitbox: 85% of 60 = 51
  const hbDelta = Math.abs(s.hitbox.y - expectedHbY);
  check('bug7_jump_hitbox', hbDelta < 2,
    `hitbox.y=${s.hitbox.y}, catY=${s.catY.toFixed(1)}, expected=${expectedHbY.toFixed(1)}, delta=${hbDelta.toFixed(2)}`);

  // ══════════════════════════════════════
  // Bug 8: Game over edge cases — no instant restart from sticky input
  // ══════════════════════════════════════
  await input('restart');
  s = await ensurePlaying(60);
  // Force game over via debug API (simulates 3-hit death mid-jump)
  await page.evaluate(() => window.__game.forceGameOver());
  await tick(2);
  s = await snap();
  check('bug8a_gameover_sticks', s.state === 'GAME_OVER' && s.deathTimer > 0,
    `state: ${s.state}, deathTimer: ${s.deathTimer} (expected GAME_OVER with cooldown)`);

  // Try to restart during cooldown — should NOT work  
  await input('start');
  await tick(5);
  s = await snap();
  check('bug8b_no_restart_during_cooldown', s.state === 'GAME_OVER',
    `state: ${s.state} (should still be GAME_OVER)`);

  // Wait for cooldown (~1s), then restart should work
  await tick(70);
  await input('start');
  await tick(5);
  s = await snap();
  check('bug8c_restart_after_cooldown', s.state !== 'GAME_OVER',
    `state: ${s.state} (should have restarted)`);

  // ══════════════════════════════════════
  // Summary
  // ══════════════════════════════════════
  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  console.log(`\n📊 Results: ${passed}/${total} passed`);
  if (passed < total) {
    const failed = results.filter(r => !r.pass).map(r => r.name);
    console.log(`❌ Failed: ${failed.join(', ')}`);
  }

  await browser.close();

  const exitCode = passed === total ? 0 : 1;
  process.exit(exitCode);
}

main().catch(err => {
  console.error('Harness error:', err.message);
  process.exit(2);
});
