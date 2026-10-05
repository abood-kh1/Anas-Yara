/**
 * ============================================================
 *  سكربت تعليقات دعوة أنس ويارا  —  Google Apps Script
 *  يربط بين ملف Google Sheets وصفحة الدعوة (index.html)
 * ============================================================
 *
 *  طريقة الاستخدام (مرة واحدة فقط):
 *  ---------------------------------
 *  1) افتح https://sheets.google.com وأنشئ ملف جديد فارغ.
 *  2) من القائمة: Extensions  >  Apps Script
 *  3) امسح أي محتوى موجود والصق هذا الكود كاملًا، ثم اضغط Save.
 *  4) اضغط Deploy  >  New deployment
 *       - Type: Web app
 *       - Execute as: Me
 *       - Who has access: Anyone          <-- مهم جدًا
 *  5) اضغط Deploy وامنح الصلاحيات (Authorize) ثم انسخ رابط Web App
 *     الذي ينتهي بـ  /exec
 *  6) انسخ الرابط وضعه في ملف index.html مكان ن��ص الفارغ:
 *
 *      const COMMENTS_API = 'رابط_الـ_web_app_هنا';
 *
 *  ملاحظات:
 *  - يجب أن تكون الصلاحية "Anyone" وإلا لن يستطيع الزوار الإرسال.
 *  - بعد أول نشر، أي تعديل على الكود يحتاج Deploy جديد (Deploy > Manage
 *    deployments > Edit > Version: New version).
 *  - الأعمدة في ملف Excel: الاسم | الرسالة | التاريخ
 * ============================================================ */

var SHEET_NAME = 'التعليقات';

function doGet(e) {
  try {
    var rows = readRows();
    return ContentService.createTextOutput(
      JSON.stringify(rows)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var data = e.parameter;
    var name = String(data.name || '').slice(0, 40).trim();
    var message = String(data.message || '').slice(0, 300).trim();

    if (!name || !message) return;

    var sheet = getSheet();
    sheet.appendRow([
      name,
      message,
      new Date().toLocaleString('ar-EG')
    ]);

    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput(String(err)).setMimeType(ContentService.MimeType.TEXT);
  }
}

/** ترتيب التعليقات: الأحدث أولًا */
function readRows() {
  var sheet = getSheet();
  var last = sheet.getLastRow();
  if (last < 2) return [];

  var values = sheet.getRange(2, 1, last - 1, 3).getValues();
  var out = [];

  for (var i = 0; i < values.length; i++) {
    var name = String(values[i][0] || '').trim();
    var message = String(values[i][1] || '').trim();
    if (!name && !message) continue;
    out.push({
      name: name,
      message: message,
      time: parseDate(values[i][2])
    });
  }

  out.reverse(); // الأحدث فوق
  return out.slice(0, 100); // حد أقصى 100 تعليق معروضة
}

/** تحويل خلية التاريخ إلى رقم milliseconds لاستخدام timeAgo */
function parseDate(value) {
  if (!value) return Date.now();
  if (value instanceof Date) return value.getTime();
  var t = Date.parse(String(value).replace(/\//g, '-'));
  return isNaN(t) ? Date.now() : t;
}

/** فتح ملف Excel المرتبط، وإنشاء صف العناوين تلقائيًا */
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('اربط السكربت بملف Google Sheets أولًا');

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, 3)
      .setValues([['الاسم', 'الرسالة', 'التاريخ']])
      .setFontWeight('bold')
      .setBackground('#f3ece2');
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 320);
    sheet.setColumnWidth(3, 160);
  }
  return sheet;
}