export function getIdFromUrl(url) {
  const [, id] = url.split('/folders/');
  return id;
}

function getTrafficLight(file) {
  if (!file || !file.url) return [];
  const sheet = global.getSheetFromSpreadSheet('Semáforo', file.url);
  return sheet.getSheetValues(1, 10, 1, 1);
}

export function getInstitutionsFolder(institution) {
  const { url, snies } = institution;
  const data = { files: [], folders: [], url };
  if (!url) return data;
  const id = getIdFromUrl(url);
  const rootFolder = DriveApp.getFolderById(id);
  const driveFiles = rootFolder.getFiles();
  const driveFolders = rootFolder.getFolders();

  while (driveFolders.hasNext()) {
    const child = driveFolders.next();
    const folder = { name: child.getName(), url: child.getUrl() };
    data.folders.push(folder);
  }
  while (driveFiles.hasNext()) {
    const child = driveFiles.next();
    const file = {
      name: child.getName(),
      url: child.getUrl(),
      type: child.getMimeType(),
    };
    const trafficLightSheet = `${snies} - 03 - Programación de acompañamiento`;
    if (file.name === trafficLightSheet) {
      const [trafficLight] = getTrafficLight(file);
      const [pendingMinutes] = trafficLight || 0;
      file.pendingMinutes = pendingMinutes;
    }
    data.files.push(file);
  }
  return data;
}
