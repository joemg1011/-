export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const randomBetween = (min, max, random = Math.random) => min + (max - min) * random();

// Integrate drag analytically so equal elapsed time behaves consistently at 30–144 Hz.
export function approach(velocity, target, drag, dt) {
  const decay = Math.exp(-drag * dt);
  return { velocity: target + (velocity - target) * decay,
    distance: target * dt + (velocity - target) * (1 - decay) / drag };
}

export function createPetal(width, height, random = Math.random, atTop = false) {
  return { x: randomBetween(-30, width + 30, random), y: atTop ? -30 : randomBetween(-30, height, random),
    vx: randomBetween(-8, 12, random), vy: randomBetween(18, 34, random),
    size: randomBetween(3, 7, random), depth: randomBetween(.5, 1.3, random),
    rotation: random() * Math.PI * 2, spin: randomBetween(-.65, .65, random), phase: random() * Math.PI * 2,
    sprite: Math.floor(random() * 4) };
}

export function advancePetal(petal, { dt, time, width, height, wind, pointer }, random = Math.random) {
  if (!(dt > 0) || !Number.isFinite(dt)) return;
  dt = Math.min(dt, .05);
  const radius = Math.min(240, Math.max(width, height) * .25);
  const influence = pointer?.active ? Math.max(0, 1 - Math.hypot(petal.x - pointer.x, petal.y - pointer.y) / radius) ** 2 : 0;
  const horizontal = approach(petal.vx, wind * 50 * petal.depth + Math.sin(time * .7 + petal.phase) * 10 + (pointer?.vx || 0) * influence * .17, 1.35, dt);
  const vertical = approach(petal.vy, 24 * petal.depth + Math.sin(time * 1.1 + petal.phase) * 9 + (pointer?.vy || 0) * influence * .1, 1.7, dt);
  petal.vx = horizontal.velocity; petal.vy = vertical.velocity;
  petal.x += horizontal.distance; petal.y += vertical.distance;
  petal.rotation += (petal.spin + wind * .2) * dt;
  // Recycle at every edge, including upward gusts, without drawing cross-screen trails.
  if (petal.y > height + 35 || petal.y < -90) {
    Object.assign(petal, createPetal(width, height, random, true));
  }
  if (petal.x > width + 45) petal.x = -40;
  if (petal.x < -45) petal.x = width + 40;
}
