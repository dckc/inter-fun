function getHeading(sheet) {
  const hd = [];
  for (
    let col = 1, name;
    (name = sheet.getRange(1, col).getValue()) > '';
    col += 1
  ) {
    hd.push(name);
  }
  return hd;
}

function getSheetRecords(sheet) {
  const hd = getHeading(sheet);
  const data = sheet.getRange(2, 1, sheet.getLastRow(), hd.length).getValues();
  const records = [];
  for (const values of data) {
    const entries = zip(hd, values);
    const record = Object.fromEntries(entries);
    if (!record[hd[0]]) break;
    records.push(record);
  }
  return { hd, records };
}

const findFieldType = (doc, kind, fieldName, sheetName = 'Field') => {
  const sheet = doc.getSheetByName(sheetName);
  const { records: fields } = getSheetRecords(sheet);
  const field = fields.find(f => f.kind === kind && f.field === fieldName);
  return field?.type;
}

function TestFieldType(kind = 'psm', field = 'anchorPoolBalance') {
  console.warn('AMBIENT: SpreadsheetApp');
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const ty = findFieldType(doc, kind, field);
  console.log({ kind, field, type: ty });
}