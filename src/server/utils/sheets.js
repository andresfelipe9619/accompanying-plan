const GOOGLE_URL = 'https://docs.google.com/spreadsheets';
const SHEET_ID = '1RNmlIWN3Hxk9Lq-0Or5smLvtgOo3YYAkjCZ9pBDf398';
const GENERAL_DB = `${GOOGLE_URL}/d/${SHEET_ID}/edit#gid=0`;

function normalizeString(value) {
  return String(value || '')
    .trim()
    .replace(/ +/g, '')
    .toLowerCase();
}

function camelCase(string) {
  return String(string)
    .toLowerCase()
    .replace(/\s(.)/g, a => a.toUpperCase())
    .replace(/\s/g, '');
}

export function getSheetFromSpreadSheet(sheet, url) {
  const Spreedsheet = SpreadsheetApp.openByUrl(url || GENERAL_DB);
  if (sheet) return Spreedsheet.getSheetByName(sheet);
  return null;
}

export function getRawDataFromSheet(sheet, url) {
  const mSheet = getSheetFromSpreadSheet(sheet, url);
  if (mSheet) {
    return mSheet.getSheetValues(
      1,
      1,
      mSheet.getLastRow(),
      mSheet.getLastColumn()
    );
  }
  return null;
}

export function findText({ sheet, text }) {
  let index = -1;
  const textFinder = sheet.createTextFinder(text).matchEntireCell(true);
  const textFound = textFinder.findNext();
  if (!textFound) return { index, data: null };
  const row = textFound.getRow();
  const col = textFound.getColumn();
  const isHouseIdCol = col === 1;
  if (isHouseIdCol) index = row;
  const data = textFound;
  return { index, data };
}

function addHeadings(sheetValues, headings) {
  return sheetValues.map(row => {
    const sheetValuesAsObject = {};

    headings.forEach((heading, column) => {
      sheetValuesAsObject[heading] = row[column];
    });

    return sheetValuesAsObject;
  });
}

export function sheetValuesToObject(values, headers) {
  const headings = headers || values[0];
  let sheetValues = null;
  if (values) sheetValues = headers ? values : values.slice(1);
  const objectWithHeadings = addHeadings(sheetValues, headings.map(camelCase));

  return objectWithHeadings;
}

export function getHeadersFromSheet(sheet) {
  let headers = [];
  if (!sheet) return headers;
  [headers] = sheet.getSheetValues(1, 1, 1, sheet.getLastColumn());
  return headers;
}

export function jsonToSheetValues(json, headers) {
  const arrayValues = new Array(headers.length);
  const lowerHeaders = headers.map(normalizeString);
  Object.keys(json).forEach(key => {
    const keyValue = normalizeString(key);
    lowerHeaders.forEach((header, index) => {
      if (keyValue === header) {
        arrayValues[index] = String(json[key]);
      }
    });
  });
  return arrayValues;
}
