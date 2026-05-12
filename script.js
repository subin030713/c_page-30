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
// 상수
// ═══════════════════════════════════════════
const STAGE_IMAGES = {
  '01':'images/stage_01.png','02':'images/stage_02.png',
  '03':'images/stage_03.png','04':'images/stage_04.png','00':'images/stage_05.png',
};
const STAGE_NAMES_MAP = {
  '01':'초반 아이디어 단계','02':'제작 진행 중',
  '03':'마무리 직전','04':'공개 이후','00':'전범위',
};
const STAGE_ORDER = ['01','02','03','04','00'];

const QUOTES = [
  {text:"어떻게든 되겠지!",attr:"정현욱"},
  {text:"즐기기도 하지만 이런 과정을 통해 작업세계가 단단해진다",attr:"비둘기"},
  {text:"죽어라 하는 수 밖에. 그래야 될 대로 된다",attr:"켠누님"},
  {text:"울면서 정신없이 밤을 새 책을 만들었다",attr:"토토"},
  {text:"녹음하면서 사과만 다섯개 먹었어요",attr:"고래"},
  {text:"끊질기게 인터넷을 뒤지고, 여러 실험을 하고, 다시 만들고",attr:"비둘기"},
  {text:"아 포기할까..그래도 시작한 거 끝까지 해야지",attr:"진원"},
];
const PERSONA_PATHS = [
  'images/egg_persona_01.png','images/egg_persona_02.png',
  'images/egg_persona_03.png','images/egg_persona_04.png',
  'images/egg_persona_05.png','images/egg_persona_06.png',
  'images/egg_persona_07.png',
];

// fallback 데이터 (시트 fetch 실패 시)
const FALLBACK_DATA = [
  {name:"닐",work:"레드벨벳 디오라마",stage:"02",stageName:"제작 진행 중",
   story:"우드락으로 집 모형을 만드는데 우드락 두께를 계산하지 않고 만들어서 세네번 다시 만들었던 기억이 있습니다.",
   solution:"그냥 다시 만들면서 손과 머리가 더블로 고생했습니다."},
  {name:"정현욱",work:"PYGMALION",stage:"01",stageName:"초반 아이디어 단계",
   story:"콘티 제작 단계가 매우 오래 걸려 독서실 등에서 수 번 밤샘을 이어갔습니다.",
   solution:"그때그때 뒤늦게라도 수습하는 방법뿐이었지만, \"어떻게든 되겠지!\"라는 가벼운 마음을 가졌습니다."},
  {name:"비둘기",work:"Gressorial Unit",stage:"00",stageName:"전범위",
   story:"초반엔 이런 복잡한 설계를 다룰 수 있는 능숙함도 없었고, 전자공학을 아주 조금 이해한 단계에서 무모하지만 시작했습니다.",
   solution:"끊질기게 인터넷을 뒤지고, 여러 실험을 하고, 다시 만들고."},
  {name:"달덩이",work:"Forget min not",stage:"03",stageName:"마무리 직전",
   story:"좋은 아이데이션이 필수적이었기에 결정되기까지 3번 정도 아이디어가 엎어졌습니다.",
   solution:"밤 새기 (해커톤처럼 목요일 낮 12시-토욜 밤까지 노 슬립)"},
  {name:"고래",work:"Plain sail",stage:"00",stageName:"전범위",
   story:"영상 색감을 수정하는게 생각보다 영상에 영향이 크더라구요. 사과만 다섯개 먹었어요.",
   solution:"같이 작업하는 사람이 있다면 소통을 무조건 해야돼요."},
  {name:"토토",work:"망했다!",stage:"02",stageName:"제작 진행 중",
   story:"토마토 주스 쏟는 사진을 찍다 실기실 바닥에 정말로 다 쏟고 난리가 났다.",
   solution:"울면서(마음 속으로) 정신 없이 밤을 새 책을 만들었다."},
  {name:"켠누님",work:"yeah",stage:"03",stageName:"마무리 직전",
   story:"날짜를 착각해 촉박한 시간에 쫓겨 비트 선정, 훅, 벌스, 연습 어느 하나 제대로 진행된 것이 없었다.",
   solution:"죽어라 외웠다."},
  {name:"진원",work:"졸업전시",stage:"04",stageName:"공개 이후",
   story:"공개 직전까지 작업이 마음에 안 들었지만 어쩔 수 없이 내보냈고, 막상 사람들 반응이 좋아서 의외였다.",
   solution:"아 포기할까..그래도 시작한 거 끝까지 해야지."},
];

// ═══════════════════════════════════════════
// 전역 데이터
// ═══════════════════════════════════════════
let DATA = [];
let currentStage = null;
let currentFilteredCases = [];
let currentCaseIdx = 0;

// ═══════════════════════════════════════════
// 페이지 전환
// ═══════════════════════════════════════════
const stageSelect = document.getElementById('stage-select');
const caseView    = document.getElementById('case-view');
const stageNav    = document.getElementById('stage-nav');

function showStageSelect() {
  caseView.classList.remove('active');
  stageSelect.classList.add('active');
}

function showCaseView(stage) {
  currentStage = stage;
  // stage '00'(전범위)이면 전체, 아니면 해당 stage 필터
  currentFilteredCases = stage === '00'
    ? DATA.slice()
    : DATA.filter(d => d.stage === stage);
  if (currentFilteredCases.length === 0) currentFilteredCases = DATA.slice();
  currentCaseIdx = Math.floor(Math.random() * currentFilteredCases.length);
  renderCase();
  renderStageNav();
  stageSelect.classList.remove('active');
  caseView.classList.add('active');
}

function renderCase() {
  const c = currentFilteredCases[currentCaseIdx];
  if (!c) return;
  const stageName = STAGE_NAMES_MAP[c.stage] || c.stageName || c.stageWhen || '';
  document.getElementById('case-name').textContent = c.name + ' / ' + c.work;
  document.getElementById('case-stage-img').src = STAGE_IMAGES[c.stage] || STAGE_IMAGES['00'];
  document.getElementById('case-stage-num').textContent = 'stage ' + c.stage;
  document.getElementById('case-stage-name').textContent = stageName;
  // G열 = solution → 왼쪽, D열 = story → 오른쪽
  document.getElementById('case-solution').textContent = c.solution;
  document.getElementById('case-story').textContent = c.story;
  document.getElementById('case-story').scrollTop = 0;
  document.getElementById('case-solution').scrollTop = 0;
}

function renderStageNav() {
  stageNav.innerHTML = '';
  const others = STAGE_ORDER.filter(s => s !== currentStage);
  others.forEach(s => {
    const item = document.createElement('div');
    item.className = 'stage-nav-item';
    item.innerHTML = `
      <img src="${STAGE_IMAGES[s]}" alt="">
      <div class="stage-nav-label">stage ${s} ${STAGE_NAMES_MAP[s]}</div>
    `;
    item.addEventListener('click', () => { if (didDrag) return; showCaseView(s); });
    stageNav.appendChild(item);
  });
}

function nextCase() {
  currentCaseIdx = (currentCaseIdx + 1) % currentFilteredCases.length;
  renderCase();
}

// ═══════════════════════════════════════════
// 이벤트 바인딩
// ═══════════════════════════════════════════
document.querySelectorAll('.stage-item').forEach(item => {
  item.addEventListener('click', () => { if (didDrag) return; showCaseView(item.dataset.stage); });
});
document.getElementById('case-stage-img').addEventListener('click', () => { if (didDrag) return; nextCase(); });
document.getElementById('back-to-stages').addEventListener('click', e => {
  e.preventDefault(); if (didDrag) return; showStageSelect();
});

// ═══════════════════════════════════════════
// 시트 데이터 로드
// ═══════════════════════════════════════════
(async () => {
  try {
    DATA = await fetchSheetData();
    if (!DATA.length) throw new Error('빈 데이터');
  } catch(e) {
    console.warn('시트 로드 실패, fallback 사용:', e);
    DATA = FALLBACK_DATA;
  }
  // solution 텍스트로 QUOTES 업데이트
  updateQuotesFromData();
})();

function updateQuotesFromData() {
  const src = DATA.length ? DATA : FALLBACK_DATA;
  // solution이 있는 항목에서 문장 추출
  const sentences = [];
  src.forEach(d => {
    if (!d.solution) return;
    // 문장 단위로 분리 (마침표, 느낌표, 물음표 기준)
    const parts = d.solution.split(/(?<=[.!?])\s+|(?<=다)\s+|(?<=요)\s+/).filter(s => s.trim().length > 5);
    parts.forEach(s => {
      const t = s.trim().replace(/["']/g, '');
      if (t.length > 5) sentences.push({ text: t, attr: d.name });
    });
    // 전체도 하나로 추가
    if (d.solution.length < 60) sentences.push({ text: d.solution.trim(), attr: d.name });
  });
  if (sentences.length > 3) {
    QUOTES.length = 0;
    sentences.forEach(s => QUOTES.push(s));
  }
}

// ═══════════════════════════════════════════
// 커서
// ═══════════════════════════════════════════
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX+'px'; cursor.style.top = e.clientY+'px';
});
document.addEventListener('mouseleave', ()=>cursor.style.opacity='0');
document.addEventListener('mouseenter', ()=>cursor.style.opacity='1');

// ═══════════════════════════════════════════
// 드래그 트레일 + quote
// ═══════════════════════════════════════════
const trailLayer  = document.getElementById('trail-layer');
const quoteBubble = document.getElementById('quote-bubble');
const quoteText   = document.getElementById('quote-text');
const quoteAttr   = document.getElementById('quote-attr');

let isDown=false,downX=-999,downY=-999,lastTrailX=-999,lastTrailY=-999;
let quoteTimer=null,didDrag=false;

document.addEventListener('mousedown',e=>{
  isDown=true;didDrag=false;
  downX=e.clientX;downY=e.clientY;lastTrailX=e.clientX;lastTrailY=e.clientY;
});
document.addEventListener('mouseup',e=>{
  if(!isDown)return;isDown=false;if(!didDrag)return;
  const q=QUOTES[Math.floor(Math.random()*QUOTES.length)];
  quoteText.textContent='"'+q.text+'"';quoteAttr.textContent='— '+q.attr;
  let qx=e.clientX+28,qy=e.clientY-30;
  if(qx+340>window.innerWidth)qx=e.clientX-360;if(qy<30)qy=e.clientY+40;
  quoteBubble.style.left=qx+'px';quoteBubble.style.top=qy+'px';quoteBubble.style.opacity='1';
  if(quoteTimer)clearTimeout(quoteTimer);
  quoteTimer=setTimeout(()=>quoteBubble.style.opacity='0',4500);
});
document.addEventListener('mousemove',e=>{
  if(!isDown)return;
  const tdx=e.clientX-downX,tdy=e.clientY-downY;
  if(!didDrag&&Math.sqrt(tdx*tdx+tdy*tdy)>30)didDrag=true;
  if(!didDrag)return;
  const dx=e.clientX-lastTrailX,dy=e.clientY-lastTrailY;
  if(Math.sqrt(dx*dx+dy*dy)<55)return;
  lastTrailX=e.clientX;lastTrailY=e.clientY;
  const idx=Math.floor(Math.random()*PERSONA_PATHS.length);
  const sz=60+Math.random()*40,rot=(Math.random()-0.5)*18,flip=Math.random()>0.5?-1:1;
  const img=document.createElement('img');
  img.src=PERSONA_PATHS[idx];img.className='trail-img';
  img.style.cssText=`left:${e.clientX}px;top:${e.clientY}px;height:${sz}px;width:auto;transform:translate(-50%,-55%) rotate(${rot}deg) scaleX(${flip});`;
  trailLayer.appendChild(img);
  requestAnimationFrame(()=>{
    img.style.opacity='0.9';
    setTimeout(()=>{img.style.transition='opacity 2.5s ease';img.style.opacity='0';setTimeout(()=>img.remove(),2600);},800);
  });
});
