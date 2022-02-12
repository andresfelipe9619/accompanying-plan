import * as publicSheetFunctions from './utils/sheets';
import * as publicDriveFunctions from './utils/drive';
import * as publicMainFunction from './app';

// Expose public functions by attaching to `global`
global.doGet = publicMainFunction.doGet;
global.doPost = publicMainFunction.doPost;

// BUSINESS LOGIC FUNCTIONS
global.isAdmin = publicMainFunction.isAdmin;
global.getCurrentUser = publicMainFunction.getCurrentUser;
global.getProfessors = publicMainFunction.getProfessors;
global.createProfessor = publicMainFunction.createProfessor;
global.updateProfessor = publicMainFunction.updateProfessor;
global.getInstitutions = publicMainFunction.getInstitutions;

// DRIVE FUNCTIONS
global.createHouseFile = publicDriveFunctions.createHouseFile;
global.createHouseCommentFile = publicDriveFunctions.createHouseCommentFile;
global.uploadHouseCommentsFiles = publicDriveFunctions.uploadHouseCommentsFiles;
global.uploadHouseFiles = publicDriveFunctions.uploadHouseFiles;
global.getHouseFolder = publicDriveFunctions.getHouseFolder;
global.getHouseCommentsFolder = publicDriveFunctions.getHouseCommentsFolder;

// SPREADSHEET FUNCTIONS
global.getSheetFromSpreadSheet = publicSheetFunctions.getSheetFromSpreadSheet;
global.getRawDataFromSheet = publicSheetFunctions.getRawDataFromSheet;
global.findText = publicSheetFunctions.findText;
global.getHeadersFromSheet = publicSheetFunctions.getHeadersFromSheet;
global.jsonToSheetValues = publicSheetFunctions.jsonToSheetValues;
global.sheetValuesToObject = publicSheetFunctions.sheetValuesToObject;
