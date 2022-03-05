export function getIdFromUrl(url) {
  const [, id] = url.split('/folders/');
  return id;
}

function getTrafficLight(file) {
  if (!file || !file.url) return [];
  const sheet = global.getSheetFromSpreadSheet('Semáforo', file.url);
  return sheet.getSheetValues(1, 10, 1, 1);
}

export function getInstitutionsFolder(url) {
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
    if (file.name === '03 - Programación de acompañamiento') {
      const [trafficLight] = getTrafficLight(file);
      file.pendingMinutes = trafficLight || 0;
    }
    data.files.push(file);
  }
  return data;
}
