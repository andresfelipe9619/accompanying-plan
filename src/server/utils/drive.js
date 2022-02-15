export function getIdFromUrl(url) {
  const [, id] = url.split('/folders/');
  return id;
}

export function getInstitutionsFolder(url) {
  const id = getIdFromUrl(url);
  const folder = DriveApp.getFolderById(id);
  const driveFiles = folder.getFiles();
  const driveFolders = folder.getFolders();
  const files = [];
  const folders = [];
  while (driveFolders.hasNext()) {
    const child = driveFolders.next();
    folders.push({ name: child.getName(), url: child.getUrl() });
  }
  while (driveFiles.hasNext()) {
    const child = driveFiles.next();
    files.push({
      name: child.getName(),
      url: child.getUrl(),
      type: child.getMimeType(),
    });
  }
  return { url, files, folders };
}
