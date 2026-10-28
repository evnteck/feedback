/**
 * Evnteck — استقبال تقييمات العملاء في Google Sheets
 * الصق هذا الكود في: Google Sheet > Extensions > Apps Script
 * ثم: Deploy > New deployment > Web app
 *   Execute as: Me   |   Who has access: Anyone
 */

// رقم (ID) ملف الـ Google Sheet — من رابط الملف: docs.google.com/spreadsheets/d/<هنا الـ ID>/edit
// اتركه فاضي إذا فتحت Apps Script من داخل الـ Sheet نفسه (Extensions > Apps Script)
const SHEET_ID = '';
const SHEET_NAME = 'Responses';
const NOTIFY_EMAIL = ''; // اختياري: ضع إيميلك لتصلك رسالة عند كل تقييم منخفض (3 نجوم أو أقل)
// كلمة مرور صفحة الأدمن (admin.html) — اختر كلمة قوية، وبدونها صفحة الأدمن لا تعمل
const ADMIN_PASSWORD = '';

const HEADERS = [
  ['timestamp', 'التاريخ والوقت'],
  ['overall', 'التقييم العام'],
  ['nps', 'درجة التوصية (0-10)'],
  ['quality', 'جودة الشاشات'],
  ['delivery', 'التوصيل والتركيب'],
  ['support', 'الدعم الفني'],
  ['staff', 'تعامل الفريق'],
  ['value', 'القيمة مقابل السعر'],
  ['eventType', 'نوع الفعالية'],
  ['screenType', 'نوع الشاشة'],
  ['eventDate', 'تاريخ الفعالية'],
  ['liked', 'ما أعجبه'],
  ['improve', 'مقترحات التحسين'],
  ['name', 'الاسم'],
  ['company', 'الجهة'],
  ['phone', 'الجوال'],
  ['contactOk', 'يوافق على التواصل'],
  ['publishOk', 'يوافق على النشر'],
  ['lang', 'اللغة'],
  ['source', 'المصدر (ref)']
];

function doPost(e) {
  let data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_request' }); }
  if (data.action === 'list') return listRows_(data.key);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    const row = HEADERS.map(([key]) => {
      if (key === 'timestamp') return new Date();
      const v = data[key] == null ? '' : String(data[key]).slice(0, 2000);
      return /^[=+\-@]/.test(v) ? "'" + v : v; // حماية من حقن الصيغ
    });
    sheet.appendRow(row);

    if (NOTIFY_EMAIL && Number(data.overall) <= 3) {
      MailApp.sendEmail(NOTIFY_EMAIL, 'Evnteck — تقييم يحتاج متابعة (' + data.overall + '/5)',
        HEADERS.map(([k, label]) => label + ': ' + (data[k] || '-')).join('\n'));
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, service: 'Evnteck feedback' });
}

// صفحة الأدمن: ترجع كل الردود بعد التحقق من كلمة المرور
function listRows_(key) {
  if (!ADMIN_PASSWORD) return json_({ ok: false, error: 'no_password' });
  if (String(key || '') !== ADMIN_PASSWORD) {
    Utilities.sleep(1500); // يبطّئ محاولات التخمين
    return json_({ ok: false, error: 'unauthorized' });
  }
  const sh = getSheet_();
  const n = sh.getLastRow();
  if (n < 2) return json_({ ok: true, rows: [] });
  const tz = ss_().getSpreadsheetTimeZone();
  const rows = sh.getRange(2, 1, n - 1, HEADERS.length).getValues().map(r => {
    const o = {};
    HEADERS.forEach(([k], i) => {
      const v = r[i];
      o[k] = v instanceof Date
        ? Utilities.formatDate(v, tz, k === 'eventDate' ? 'yyyy-MM-dd' : "yyyy-MM-dd'T'HH:mm:ss")
        : v;
    });
    return o;
  });
  return json_({ ok: true, rows: rows });
}

function ss_() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID.trim()) : SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet_() {
  const ss = ss_();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS.map(h => h[1]));
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#450F67').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.setRightToLeft(true);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
