import { clamp, randomBetween, createPetal, advancePetal } from './wind-physics.mjs';

const art = document.querySelector('#art');
const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const landscape = document.querySelector('#landscape');
const pauseButton = document.querySelector('#pause');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(any-pointer: fine)');
const girl = new Image();
girl.src = new URL('./spring-girl.webp', import.meta.url).href;
let width = 1, height = 1, scale = 1, imageRect, girlSprite;
let petals = [], ripples = [], frame = 0, lastTime = 0, elapsed = 0;
let paused = motionPreference.matches, wind = .25, keyboardWind = 0, gustPower = 0;
let noticeTimer, resizeFrame;
const pointer = { x: 0, y: 0, vx: 0, vy: 0, active: false, last: 0 };

function announce(message) {
  clearTimeout(noticeTimer);
  document.querySelector('#notice').textContent = message;
  noticeTimer = setTimeout(() => { document.querySelector('#notice').textContent = ''; }, 3600);
}

function resize() {
  const previousWidth = width, previousHeight = height;
  const rect = art.getBoundingClientRect();
  width = Math.max(1, rect.width); height = Math.max(1, rect.height);
  scale = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const portrait = width / height < .8;
  const zoom = portrait ? height * .83 / 1024 : Math.max(width / 1536, height / 1024);
  imageRect = { width: 1536 * zoom, height: 1024 * zoom, zoom,
    x: portrait ? width * .5 - 1536 * zoom * .65 : (width - 1536 * zoom) / 2,
    y: portrait ? height * .17 : (height - 1024 * zoom) / 2,
    footerLimit: portrait ? document.querySelector('.footer').getBoundingClientRect().top - rect.top - 14 : Infinity };
  Object.assign(landscape.style, { width: `${imageRect.width}px`, height: `${imageRect.height}px`, left: `${imageRect.x}px`, top: `${imageRect.y}px` });
  const count = Math.round(clamp(width * height / 6500, 42, 170));
  petals = petals.length ? petals.map(p => ({ ...p, x: p.x / previousWidth * width, y: p.y / previousHeight * height })) : Array.from({ length: count }, () => createPetal(width, height));
  petals.length = Math.min(petals.length, count);
  while (petals.length < count) petals.push(createPetal(width, height));
  ripples = [];
  render();
}

// Small pencil-textured sprites are painted once, then reused instead of rebuilding paths per frame.
const petalSprites = Array.from({ length: 4 }, (_, index) => {
  const sprite = document.createElement('canvas'); sprite.width = sprite.height = 48;
  const pen = sprite.getContext('2d');
  pen.translate(24, 24); pen.rotate(index * .5);
  pen.beginPath(); pen.moveTo(-15, 0); pen.bezierCurveTo(-7, -11, 7, -14, 15, -1); pen.bezierCurveTo(4, 10, -9, 8, -15, 0);
  pen.fillStyle = ['#d79999', '#e2a9a2', '#e9beb0', '#c98b94'][index]; pen.fill();
  pen.strokeStyle = '#9d6d7155'; pen.lineWidth = .8; pen.stroke(); pen.save(); pen.clip();
  for (let i = 0; i < 80; i++) {
    const x = randomBetween(-17, 17), y = randomBetween(-12, 12);
    pen.strokeStyle = i % 2 ? '#fff4dc65' : '#a6706f35'; pen.lineWidth = .55;
    pen.beginPath(); pen.moveTo(x, y); pen.lineTo(x + randomBetween(1, 4), y - 2); pen.stroke();
  }
  pen.restore(); pen.beginPath(); pen.moveTo(-12, .5); pen.quadraticCurveTo(0, -2, 11, -.3); pen.strokeStyle = '#a46b7755'; pen.stroke();
  return sprite;
});

function drawGirl() {
  if (!girlSprite || !imageRect) return;
  const h = imageRect.height * .325, w = h * girlSprite.width / girlSprite.height;
  const x = imageRect.x + imageRect.width * .65 - w * .5;
  const y = Math.min(imageRect.y + imageRect.height * (width / height < .8 ? .76 : .84), imageRect.footerLimit) - h;
  ctx.save();
  ctx.fillStyle = '#5e60452b'; ctx.beginPath(); ctx.ellipse(x + w * .51, y + h * .963, w * .22, h * .014, -.06, 0, Math.PI * 2); ctx.fill();
  // The feet stay planted. Only hair and cloth receive a soft continuous deformation.
  for (let sy = 0; sy < girlSprite.height; sy += 6) {
    const part = sy / girlSprite.height;
    const hair = Math.exp(-(((part - .28) / .19) ** 2));
    const hem = Math.exp(-(((part - .72) / .14) ** 2));
    const sway = (Math.sin(elapsed * 1.25 + part * 5) * .7 + wind * .75) * (hair * .8 + hem * 1.4) * imageRect.zoom;
    const strip = Math.min(6, girlSprite.height - sy);
    ctx.drawImage(girlSprite, 0, sy, girlSprite.width, strip, x + sway, y + part * h, w, strip / girlSprite.height * h + .3);
  }
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, width, height);
  drawGirl();
  for (const p of petals) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
    ctx.globalAlpha = .45 + p.depth * .28;
    ctx.scale(1, .42 + Math.abs(Math.cos(elapsed * 1.2 + p.phase)) * .58);
    ctx.drawImage(petalSprites[p.sprite], -p.size, -p.size, p.size * 2, p.size * 2); ctx.restore();
  }
  for (const ripple of ripples) {
    ctx.save(); ctx.globalAlpha = (1 - ripple.age / 1.5) * .22; ctx.strokeStyle = '#956d70'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.ellipse(ripple.x, ripple.y, 15 + ripple.age * 75, 9 + ripple.age * 42, -.2, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  if (pointer.active && !paused && finePointer.matches) {
    ctx.save(); ctx.strokeStyle = '#946c70'; ctx.lineWidth = .8; ctx.globalAlpha = .8;
    ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 2, 0, Math.PI * 2); ctx.fillStyle = '#946c70'; ctx.fill(); ctx.restore();
  }
}

function tick(timestamp) {
  frame = 0;
  if (paused || document.hidden) { lastTime = 0; return; }
  const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, .05) : 0;
  lastTime = timestamp; elapsed += dt;
  const targetWind = .22 + Math.sin(elapsed * .22) * .17 + keyboardWind + gustPower + (pointer.active ? (pointer.x / width - .5) * 1.5 : 0);
  wind += (targetWind - wind) * (1 - Math.exp(-dt * 2));
  gustPower *= Math.exp(-dt * .8);
  pointer.vx *= Math.exp(-dt * 4); pointer.vy *= Math.exp(-dt * 4);
  for (const petal of petals) advancePetal(petal, { dt, time: elapsed, width, height, wind, pointer });
  for (const ripple of ripples) ripple.age += dt;
  ripples = ripples.filter(ripple => ripple.age < 1.5);
  render(); requestFrame();
}
function requestFrame() {
  if (!frame && !paused && !document.hidden) frame = requestAnimationFrame(tick);
}
function setPaused(value, notify = false) {
  paused = value; lastTime = 0;
  art.dataset.state = paused ? 'paused' : 'running';
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.setAttribute('aria-label', paused ? '애니메이션 재생' : '애니메이션 일시정지');
  document.querySelector('#pause-label').textContent = paused ? '다시 흐르기' : '잠시 멈춤';
  document.querySelector('#pause-icon').setAttribute('d', paused ? 'M6 3l10 7-10 7Z' : 'M7 4v12M13 4v12');
  if (paused) { cancelAnimationFrame(frame); frame = 0; render(); } else requestFrame();
  if (notify) announce(paused ? '이 오후를 잠시 멈췄어요.' : '다시, 바람이 흐릅니다.');
}

function makeGust(x = width * .66, y = height * .48) {
  if (paused) { announce('‘다시 흐르기’를 누르면 꽃바람이 움직여요.'); return; }
  gustPower = clamp(gustPower + (keyboardWind < 0 ? -1.7 : 1.7), -3, 3);
  ripples.push({ x, y, age: 0 }); ripples = ripples.slice(-4);
  // A bounded burst retains a stable memory footprint even after repeated clicks.
  for (let i = 0; i < 10; i++) {
    const p = petals[Math.floor(Math.random() * petals.length)];
    if (p) Object.assign(p, { x: x + randomBetween(-65, 65), y: y + randomBetween(-45, 30), vx: randomBetween(30, 100), vy: randomBetween(-30, 5) });
  }
}
function readPointer(event) {
  const rect = canvas.getBoundingClientRect();
  const x = clamp(event.clientX - rect.left, 0, width), y = clamp(event.clientY - rect.top, 0, height);
  const dt = Math.max(.016, (event.timeStamp - pointer.last) / 1000);
  pointer.vx = pointer.active ? clamp((x - pointer.x) / dt, -1800, 1800) : 0;
  pointer.vy = pointer.active ? clamp((y - pointer.y) / dt, -1800, 1800) : 0;
  pointer.x = x; pointer.y = y; pointer.active = true; pointer.last = event.timeStamp;
}
canvas.addEventListener('pointermove', readPointer);
canvas.addEventListener('pointerdown', event => { readPointer(event); makeGust(pointer.x, pointer.y); });
for (const type of ['pointerleave', 'pointercancel']) canvas.addEventListener(type, () => { pointer.active = false; pointer.vx = pointer.vy = 0; });
canvas.addEventListener('pointerup', event => { if (event.pointerType !== 'mouse') pointer.active = false; });
canvas.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter'].includes(event.key)) return;
  event.preventDefault();
  if (event.key === ' ') setPaused(!paused, true);
  else if (event.key === 'Enter') makeGust();
  else { keyboardWind = clamp(keyboardWind + (event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -.5 : .5), -2, 2); announce(keyboardWind < 0 ? '바람이 왼쪽으로 흐릅니다.' : '바람이 오른쪽으로 흐릅니다.'); }
});
pauseButton.addEventListener('click', () => setPaused(!paused, true));
document.querySelector('#gust').addEventListener('click', () => makeGust());
addEventListener('resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(resize); });
document.addEventListener('visibilitychange', () => {
  lastTime = 0; pointer.active = false;
  if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else requestFrame();
});
motionPreference.addEventListener('change', event => setPaused(event.matches));

resize(); setPaused(paused);
Promise.allSettled([landscape.decode(), girl.decode()]).then(results => {
  if (results[1].status === 'fulfilled') {
    girlSprite = document.createElement('canvas'); girlSprite.width = 400; girlSprite.height = 600;
    girlSprite.getContext('2d').drawImage(girl, 0, 0, 400, 600);
  }
  art.dataset.assets = results.every(r => r.status === 'fulfilled') ? 'ready' : 'error';
  if (art.dataset.assets === 'error') document.querySelector('#loading-note').textContent = '그림을 모두 불러오지 못했어요. 새로고침해 주세요.';
  render();
});
