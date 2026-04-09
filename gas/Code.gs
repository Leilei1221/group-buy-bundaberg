// ══════════════════════════════════════════════════════════
//  BUNDABERG 賓德寶氣泡飲同事團購 - 訂單接收 GAS（每口味獨立一欄）
//  部署方式：部署 → 新增部署作業 → 網頁應用程式
//    - 執行身分：我（你的 Google 帳號）
//    - 存取者：所有人
// ══════════════════════════════════════════════════════════

// 商品清單（順序決定欄位順序）
const PRODUCT_LIST = [
  { id: 'p05_guava',   name: '⭐ 紅心芭樂',   price: 80 },
  { id: 'p07_ginger',  name: '⭐ 經典薑汁',   price: 80 },
  { id: 'p08_mango',   name: '⭐ 熱帶芒果',   price: 80 },
  { id: 'p02_grape',   name: '粉紅葡萄柚',   price: 80 },
  { id: 'p03_passion', name: '百香果',       price: 80 },
  { id: 'p06_peach',   name: '蜜桃',         price: 80 },
  { id: 'p04_lemon',   name: '青青檸檬',     price: 80 },
  { id: 'p10_blood',   name: '清新血橙',     price: 80 },
  { id: 'p09_sarsap',  name: '沙士',         price: 80 },
];

const TOTAL_COLS = 2 + PRODUCT_LIST.length + 3; // 時間+姓名+各口味+摘要+總金額+備註

function getOrCreateSheet() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty('SPREADSHEET_ID');

  if (!ssId) {
    const ss = SpreadsheetApp.create('🫧 BUNDABERG 賓德寶氣泡飲 訂單紀錄');
    const sheet = ss.getActiveSheet();
    sheet.setName('訂單');
    setupHeaders(sheet);
    ssId = ss.getId();
    props.setProperty('SPREADSHEET_ID', ssId);
    Logger.log('新試算表已建立，ID: ' + ssId);
    Logger.log('試算表網址: ' + ss.getUrl());
  }

  return SpreadsheetApp.openById(ssId).getSheetByName('訂單');
}

function setupHeaders(sheet) {
  const headers = ['時間戳記', '姓名'];
  PRODUCT_LIST.forEach(p => headers.push(p.name + '\n$' + p.price));
  headers.push('訂購摘要', '總金額（元）', '備註及回覆');

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // 標題格式
  const hRange = sheet.getRange(1, 1, 1, headers.length);
  hRange.setBackground('#1a5c2a');
  hRange.setFontColor('#ffffff');
  hRange.setFontWeight('bold');
  hRange.setFontSize(10);
  hRange.setHorizontalAlignment('center');
  hRange.setWrap(true);
  sheet.setRowHeight(1, 48);

  // 欄寬
  sheet.setColumnWidth(1, 155);
  sheet.setColumnWidth(2, 75);
  for (let i = 3; i <= 2 + PRODUCT_LIST.length; i++) {
    sheet.setColumnWidth(i, 78);
  }
  const summaryCol = 2 + PRODUCT_LIST.length + 1;
  sheet.setColumnWidth(summaryCol, 220);
  sheet.setColumnWidth(summaryCol + 1, 90);
  sheet.setColumnWidth(summaryCol + 2, 160);

  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);
}

function doPost(e) {
  try {
    const params  = e.parameter;
    const name    = params.name    || '（未填）';
    const total   = Number(params.total) || 0;
    const note    = params.note    || '';
    const summary = params.summary || '';

    const sheet = getOrCreateSheet();
    const now = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd HH:mm:ss');

    // 自動產生回覆文字
    const itemLines = [];
    PRODUCT_LIST.forEach(p => {
      const q = parseInt(params[p.id] || '0', 10);
      if (q > 0) itemLines.push(`${p.name} ${q}瓶 單價${p.price}元`);
    });
    const replyMsg = `${name}你好，你所訂購的產品如下：${itemLines.join('、')}、總金額：${total}元${note ? '\n備註：' + note : ''}`;

    const row = [now, name];
    PRODUCT_LIST.forEach(p => {
      const q = parseInt(params[p.id] || '0', 10);
      row.push(q > 0 ? q : '');
    });
    row.push(summary, total, replyMsg);

    sheet.appendRow(row);

    const lastRow = sheet.getLastRow();
    const color = (lastRow % 2 === 0) ? '#e8f5ea' : '#ffffff';
    sheet.getRange(lastRow, 1, 1, TOTAL_COLS).setBackground(color);
    sheet.getRange(lastRow, 3, 1, PRODUCT_LIST.length).setHorizontalAlignment('center');
    const summaryCol = 2 + PRODUCT_LIST.length + 1;
    sheet.getRange(lastRow, summaryCol).setWrap(true);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'BUNDABERG 賓德寶氣泡飲訂單系統運作中' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheetUrl() {
  const props = PropertiesService.getScriptProperties();
  const ssId = props.getProperty('SPREADSHEET_ID');
  if (!ssId) { Logger.log('尚未建立試算表'); return; }
  Logger.log('試算表網址: ' + SpreadsheetApp.openById(ssId).getUrl());
}
