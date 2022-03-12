export const getCurrentUser = () => Session.getActiveUser().getEmail();

function createHtmlTemplate(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .setTitle('Plan de Acompañamiento')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

export function doGet() {
  return createHtmlTemplate('index.html');
}

export function doPost(request) {
  Logger.log('request');
  Logger.log(request);

  if (typeof request !== 'undefined') {
    Logger.log(request);
    const params = request.parameter;
    Logger.log('params');
    Logger.log(params);
    return ContentService.createTextOutput(JSON.stringify(request.parameter));
  }
  return null;
}

function getEntityData(entity) {
  const rawEntities = global.getRawDataFromSheet(entity);
  const entities = global.sheetValuesToObject(rawEntities);
  return entities;
}

function getProfessorsSheet() {
  const sheet = global.getSheetFromSpreadSheet('PROFESORES');
  const headers = global.getHeadersFromSheet(sheet);
  return { sheet, headers };
}

export function getProfessors() {
  return getEntityData('PROFESORES');
}

export function getLines() {
  return getEntityData('LINEAS');
}

export function getRoles() {
  return getEntityData('ROLES');
}

export function getInstitutions() {
  return getEntityData('INSTITUCIONES EDUCATIVAS');
}

export function getAccompanyingData() {
  const user = getCurrentUser();
  Logger.log('user');
  Logger.log(user);
  const lines = getLines();
  Logger.log('lines');
  Logger.log(lines);
  const insts = getInstitutions();
  Logger.log('insts');
  Logger.log(insts);
  let profes = getProfessors();
  Logger.log('profes');
  Logger.log(profes);
  profes = profes.map(p => ({
    ...p,
    roles: p.rol.split(','),
    lineas: p.linea.split(','),
    instituciones: insts
      .filter(i => i.profesional === p.correo)
      .map(i => ({ ...i, nombreProfesional: p.nombre })),
  }));
  const data = [user, profes, lines, insts];
  return data;
}

function registerEntity(table, form) {
  Logger.log(`=============Registering ${table}===========`);
  const response = { ok: false, data: null };
  const sheet = global.getSheetFromSpreadSheet(table);
  const headers = global.getHeadersFromSheet(sheet);

  const currentLastRow = sheet.getLastRow();
  let lastRowId = 0;
  if (currentLastRow > 1) {
    [lastRowId] = sheet.getSheetValues(currentLastRow, 1, 1, 1);
  }

  const entityJson = {
    id: +lastRowId + 1,
    ...form,
  };
  const entityValues = global.jsonToSheetValues(entityJson, headers);
  Logger.log(`${table} VALUES`);
  Logger.log(entityValues);

  sheet.appendRow(entityValues);
  const rowsAfter = sheet.getLastRow();
  const recordInserted = rowsAfter > currentLastRow;

  if (recordInserted) {
    response.ok = true;
    response.data = entityJson;
  }
  Logger.log(`=============END Registering ${table}===========`);
  return response;
}

function searchEntity({ name, getEntitySheet, entityId, idGetter }) {
  Logger.log(`=============Searching ${name}===========`);
  const { sheet, headers } = getEntitySheet();
  const result = {
    index: -1,
    data: null,
  };
  const { index: entityIndex } = global.findText({ sheet, text: entityId });
  Logger.log(`${name} Index ${entityIndex}`);
  if (entityIndex <= -1) return result;

  const entityRange = sheet.getSheetValues(
    +entityIndex,
    1,
    1,
    sheet.getLastColumn()
  );
  Logger.log(`${name} Range: ${entityRange.length}`);
  Logger.log(entityRange);
  const [entityData] = global.sheetValuesToObject(entityRange, headers);
  Logger.log(`${name} Data:`);
  Logger.log(entityData);
  const isSameDocument = String(idGetter(entityData)) === String(entityId);
  if (!isSameDocument) return result;

  result.index = entityIndex;
  result.data = entityData;
  Logger.log(result);
  Logger.log('=============END Searching House===========');
  return result;
}

export function searchProfessor(id) {
  const result = searchEntity({
    name: 'House',
    entityId: id,
    getEntitySheet: getProfessorsSheet,
    idGetter: entity => entity.id,
  });
  return result;
}

function updateEntity({
  name,
  idGetter,
  findEntity,
  serializedData,
  getEntitySheet,
}) {
  try {
    const response = { ok: false, data: null };
    const form = JSON.parse(serializedData);
    Logger.log(`Submitted Form ${name} Data`);
    Logger.log(form);
    const { data, index } = findEntity(idGetter(form));
    if (!index) throw new Error(`${name} does not exists`);
    const { sheet, headers } = getEntitySheet();
    const entityRange = sheet.getRange(+index, 1, 1, sheet.getLastColumn());
    const entityData = global.jsonToSheetValues({ ...data, ...form }, headers);
    Logger.log(`${name} Data`);
    Logger.log(entityData);

    entityRange.setValues([entityData]);

    response.ok = true;
    response.data = entityData;
    return response;
  } catch (error) {
    Logger.log(error);
    throw new Error('Error updating house');
  }
}

export function updateProfessor(serializedData) {
  const response = updateEntity({
    serializedData,
    name: 'House',
    findEntity: searchProfessor,
    getEntitySheet: getProfessorsSheet,
    idGetter: entity => entity.id,
  });
  return response;
}

// function avoidCollisionsInConcurrentAccessess() {
//   const lock = LockService.getPublicLock();
//   lock.waitLock(15000);
// }

export function createProfessor(formString) {
  const form = JSON.parse(formString);
  if (!form || !Object.keys(form).length) throw new Error('No data sent');
  try {
    // avoidCollisionsInConcurrentAccessess();
    Logger.log('Data for registering');
    Logger.log(form);
    const response = registerEntity('PROFESORES', form);
    Logger.log('Response');
    Logger.log(response);
    return response;
  } catch (error) {
    Logger.log('Error Registering Professor');
    Logger.log(error);
    return error.toString();
  }
}
