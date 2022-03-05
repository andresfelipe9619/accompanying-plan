export function getIdFromUrl(url) {
  const [, id] = url.split('/folders/');
  return id;
}

export function getInstitutionsFolder(url) {
  const data = { files: [], folders: [], url };
  if (!url) return data;
  const id = getIdFromUrl(url);
  const folder = DriveApp.getFolderById(id);
  const driveFiles = folder.getFiles();
  const driveFolders = folder.getFolders();
  while (driveFolders.hasNext()) {
    const child = driveFolders.next();
    data.folders.push({ name: child.getName(), url: child.getUrl() });
  }
  while (driveFiles.hasNext()) {
    const child = driveFiles.next();
    data.files.push({
      name: child.getName(),
      url: child.getUrl(),
      type: child.getMimeType(),
    });
  }
  return data;
}
