// ═══════════════════════════════════════════
// 자동 스케일
// ═══════════════════════════════════════════
const scaleWrapper = document.getElementById('scale-wrapper');
function fitScale() {
  const sx = window.innerWidth / 1920;
  const sy = window.innerHeight / 1200;
  scaleWrapper.style.transform = `scale(${Math.min(sx, sy)})`;
}
fitScale();
window.addEventListener('resize', fitScale);


// ═══════════════════════════════════════════
// 인터뷰 quote (드래그 끝)
// ═══════════════════════════════════════════
const QUOTES = [
  { text: "어떻게든 되겠지!", attr: "정현욱" },
  { text: "즐기기도 하지만 이런 과정을 통해 작업세계가 단단해진다", attr: "비둘기" },
  { text: "죽어라 하는 수 밖에. 그래야 될 대로 된다", attr: "켠누님" },
  { text: "울면서 정신없이 밤을 새 책을 만들었다", attr: "토토" },
  { text: "녹음하면서 사과만 다섯개 먹었어요", attr: "고래" },
  { text: "끊질기게 인터넷을 뒤지고, 여러 실험을 하고, 다시 만들고", attr: "비둘기" },
  { text: "아 포기할까..그래도 시작한 거 끝까지 해야지", attr: "진원" },
];

const PERSONA_PATHS = [
  'images/egg_persona_01.png',
  'images/egg_persona_02.png',
  'images/egg_persona_03.png',
  'images/egg_persona_04.png',
  'images/egg_persona_05.png',
  'images/egg_persona_06.png',
  'images/egg_persona_07.png',
];
const PERSONA_SIZE_RANGE = [60, 100];


// ═══════════════════════════════════════════
// 커서
// ═══════════════════════════════════════════
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });


// ═══════════════════════════════════════════
// 드래그 트레일 + quote
// ═══════════════════════════════════════════
const trailLayer = document.getElementById('trail-layer');
const quoteBubble = document.getElementById('quote-bubble');
const quoteText = document.getElementById('quote-text');
const quoteAttr = document.getElementById('quote-attr');

let isDown = false;
let downX = -999, downY = -999;
let lastTrailX = -999, lastTrailY = -999;
const TRAIL_SPACING = 55;
const DRAG_THRESHOLD = 30;
let quoteTimer = null;
let didDrag = false;

// 링크 클릭은 드래그 판정 후에만 막기
document.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', e => {
    if (didDrag) e.preventDefault();
  });
});

document.addEventListener('mousedown', e => {
  isDown = true;
  didDrag = false;
  downX = e.clientX;
  downY = e.clientY;
  lastTrailX = e.clientX;
  lastTrailY = e.clientY;
});

document.addEventListener('mouseup', e => {
  if (!isDown) return;
  isDown = false;
  if (!didDrag) return;

  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  quoteText.textContent = '"' + q.text + '"';
  quoteAttr.textContent = '— ' + q.attr;

  let qx = e.clientX + 28;
  let qy = e.clientY - 30;
  if (qx + 340 > window.innerWidth) qx = e.clientX - 360;
  if (qy < 30) qy = e.clientY + 40;

  quoteBubble.style.left = qx + 'px';
  quoteBubble.style.top = qy + 'px';
  quoteBubble.style.opacity = '1';

  if (quoteTimer) clearTimeout(quoteTimer);
  quoteTimer = setTimeout(() => {
    quoteBubble.style.opacity = '0';
  }, 4500);
});

document.addEventListener('mousemove', e => {
  if (!isDown) return;

  const totalDx = e.clientX - downX;
  const totalDy = e.clientY - downY;
  if (!didDrag && Math.sqrt(totalDx*totalDx + totalDy*totalDy) > DRAG_THRESHOLD) {
    didDrag = true;
  }
  if (!didDrag) return;

  const dx = e.clientX - lastTrailX;
  const dy = e.clientY - lastTrailY;
  if (Math.sqrt(dx*dx + dy*dy) < TRAIL_SPACING) return;
  lastTrailX = e.clientX;
  lastTrailY = e.clientY;

  const idx = Math.floor(Math.random() * PERSONA_PATHS.length);
  const sz = PERSONA_SIZE_RANGE[0] + Math.random() * (PERSONA_SIZE_RANGE[1] - PERSONA_SIZE_RANGE[0]);
  const rot = (Math.random() - 0.5) * 18;
  const flip = Math.random() > 0.5 ? -1 : 1;

  const img = document.createElement('img');
  img.src = PERSONA_PATHS[idx];
  img.className = 'trail-img';
  img.style.cssText = `
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    height: ${sz}px;
    width: auto;
    transform: translate(-50%, -55%) rotate(${rot}deg) scaleX(${flip});
  `;
  trailLayer.appendChild(img);

  requestAnimationFrame(() => {
    img.style.opacity = '0.9';
    setTimeout(() => {
      img.style.transition = 'opacity 2.5s ease';
      img.style.opacity = '0';
      setTimeout(() => img.remove(), 2600);
    }, 800);
  });
});
