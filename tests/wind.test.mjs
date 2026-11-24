import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createPetal, advancePetal, approach } from '../assets/wind-physics.mjs';

test('drag integration covers equal distances at 30, 60 and 144 Hz', () => {
  const run = fps => {
    let velocity = -10, distance = 0;
    for (let i = 0; i < fps * 5; i++) {
      const next = approach(velocity, 40, 1.35, 1 / fps);
      velocity = next.velocity; distance += next.distance;
    }
    return distance;
  };
  assert.ok(Math.abs(run(30) - run(144)) < 1e-8);
  assert.ok(Math.abs(run(60) - run(144)) < 1e-8);
});

test('falling particles have consistent trajectories at different refresh rates', () => {
  const run = fps => {
    const petal = createPetal(1500, 1000, () => .5);
    for (let i = 0; i < fps * 4; i++) advancePetal(petal, {dt:1/fps, time:(i+.5)/fps,width:1500,height:1000,wind:.4});
    return petal;
  };
  const slow = run(30), fast = run(144);
  assert.ok(Math.hypot(slow.x-fast.x,slow.y-fast.y) < .1);
});

test('a paused or invalid timestep cannot move a petal', () => {
  const petal = createPetal(600, 400, () => .5), original = {...petal};
  for (const dt of [0, -1, NaN]) advancePetal(petal, {dt,time:1,width:600,height:400,wind:2});
  assert.deepEqual(petal, original);
});

test('particles recycle at all viewport edges under prolonged wind', () => {
  const petal = createPetal(390, 844, () => .5);
  for (let i=0; i<12000; i++) {
    advancePetal(petal,{dt:1/60,time:i/60,width:390,height:844,wind:i%1000<500?-4:4,pointer:{active:true,x:200,y:400,vx:900,vy:-900}},()=>.5);
    assert.ok(petal.x>=-45 && petal.x<=435);
    assert.ok(petal.y>=-90 && petal.y<=879);
    assert.ok(Number.isFinite(petal.rotation));
  }
});

test('cursor motion influences nearby petals more than distant ones', () => {
  const near = {...createPetal(1200,900,()=>.5),x:100,y:100}, far = {...near,x:1000,y:700};
  const options = {dt:1/60,time:0,width:1200,height:900,wind:0,pointer:{active:true,x:100,y:100,vx:1000,vy:0}};
  advancePetal(near,options);advancePetal(far,options);
  assert.ok(near.vx > far.vx);
});

test('both existing media-art URLs serve the same page and every local asset exists', () => {
  const page = readFileSync(new URL('../media-art.html',import.meta.url),'utf8');
  assert.equal(page,readFileSync(new URL('../media-art-new.html',import.meta.url),'utf8'));
  for (const match of page.matchAll(/(?:src|href)="(assets\/[^"?]+)/g)) assert.ok(existsSync(new URL('../'+match[1],import.meta.url)),match[1]);
  assert.ok(existsSync(new URL('../assets/spring-girl.webp',import.meta.url)));
});
