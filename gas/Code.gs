// BUNDABERG 賓德寶氣泡飲 同事團購 - 訂單接收
// 部署為「網頁應用程式」，執行身分：我，存取者：所有人

const SHEET_NAME = 'BUNDABERG賓德寶氣泡飲團購';

function getOrCreateSheet() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty('SS_ID');
  let ss;

  if (ssId) {
    try { ss = SpreadsheetApp.openById(ssId); }
    catch(e) { ssId = null; }
  }

  if (!ssId) {
    ss = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('SS_ID', ss.getId());
    const sheet = ss.getActiveSheet();
    sheet.setName('訂單');
    const headers = ['時間戳記', '姓名', '訂購品項', '總金額（元）', '備註'];
    sheet.appendRow(headers);
    // 標題列格式
    const hRange = sheet.getRange(1, 1, 1, headers.length);
    hRange.setBackground('#1a5c2a').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 80);
    sheet.setColumnWidth(3, 320);
    sheet.setColumnWidth(4, 100);
    sheet.setColumnWidth(5, 200);
  }

  return ss.getSheets()[0];
}

function doPost(e) {
  try {
    const params = e.parameter;
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow() + 1;

    sheet.appendRow([
      params.timestamp || new Date().toLocaleString('zh-TW'),
      params.name || '',
      params.items || '',
      params.total || 0,
      params.note || ''
    ]);

    // 偶數列底色
    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, 5).setBackground('#e8f5ea');
    }
    // 自動換行
    sheet.getRange(lastRow, 3).setWrap(true);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 在 GAS 編輯器執行此函式，可在 Logger 看到試算表連結
function getSpreadsheetUrl() {
  const props = PropertiesService.getScriptProperties();
  const ssId = props.getProperty('SS_ID');
  if (ssId) {
    Logger.log(SpreadsheetApp.openById(ssId).getUrl());
  } else {
    Logger.log('尚無試算表，等第一筆訂單送出後再執行。');
  }
}
