const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSDKGr1YF8nOvihprNgt5m60Q7suDlXBvECUT16VCPiA8fkf7nT65-ZNvvSTjEmyP06Z0fRcuxxPa3b/pub?gid=370000933&single=true&output=csv';

function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i+1];
    if (inQuote) {
      if (ch === '"' && next === '"') { cell += '"'; i++; }
      else if (ch === '"') { inQuote = false; }
      else { cell += ch; }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { row.push(cell.trim()); cell = ''; }
      else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        row.push(cell.trim()); rows.push(row); row = []; cell = '';
      } else { cell += ch; }
    }
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows;
}

function parseStage(text) {
  if (!text) return '00';
  const t = text.trim();
  if (t.includes('초반') || t.includes('아이디어')) return '01';
  if (t.includes('제작') || t.includes('진행')) return '02';
  if (t.includes('마무리') || t.includes('직전')) return '03';
  if (t.includes('공개') || t.includes('이후')) return '04';
  return '00';
}

function driveUrlToImg(url) {
  if (!url) return null;
  url = url.trim();
  if (!url) return null;
  // 형식1: /open?id=FILE_ID
  const m1 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/uc?export=view&id=${m1[1]}`;
  // 형식2: /file/d/FILE_ID/view
  const m2 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
  if (url.startsWith('http')) return url;
  return null;
}

// 확정 컬럼:
// col1: 번호, col4: 이름, col5: 작업명
// col6: 우여곡절내용, col7: 언제, col8: 얼마나
// col9: 지나간방법, col10: 아카이빙형태
// col11~15: 이미지 Drive 링크들 (있는 것 중 첫 번째 사용)
function rowToEntry(cols) {
  // 이미지: col11~15 중 유효한 첫 번째
  let imageUrl = null;
  for (let i = 11; i <= 15; i++) {
    const img = driveUrlToImg(cols[i] || '');
    if (img) { imageUrl = img; break; }
  }

  return {
    num:          (cols[1] || '').trim(),
    name:         (cols[4] || '').trim(),
    work:         (cols[5] || '').trim(),
    story:        (cols[6] || '').trim(),
    stageWhen:    (cols[7] || '').trim(),
    stageDuration:(cols[8] || '').trim(),
    stage:        parseStage(cols[7]),
    solution:     (cols[9] || '').trim(),
    archiveType:  (cols[10] || '').trim(),
    imageUrl:     imageUrl,
  };
}

const STAGE_NAMES = {
  '01':'초반 아이디어 단계',
  '02':'제작 진행 중',
  '03':'마무리 직전',
  '04':'공개 이후',
  '00':'전범위',
};

async function fetchSheetData() {
  const res = await fetch(SHEET_CSV_URL);
  if (!res.ok) throw new Error('fetch 실패: ' + res.status);
  const text = await res.text();
  const rows = parseCSV(text);
  // index4부터, 이름(col4)과 우여곡절(col6) 있는 행만
  return rows.slice(4)
    .filter(r => r.length > 6 && (r[4]||'').trim() && (r[6]||'').trim())
    .map(rowToEntry);
}
