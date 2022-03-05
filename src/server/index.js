import * as publicSheetFunctions from './utils/sheets';
import * as publicDriveFunctions from './utils/drive';
import * as publicMainFunction from './app';
import onSpreadSheetEdit from './trigger';

// Expose public functions by attaching to `global`
global.doGet = publicMainFunction.doGet;
global.doPost = publicMainFunction.doPost;

// TRIGGER FUNCTION
global.onSpreadSheetEdit = onSpreadSheetEdit;

// BUSINESS LOGIC FUNCTIONS
global.getCurrentUser = publicMainFunction.getCurrentUser;
global.getProfessors = publicMainFunction.getProfessors;
global.getLines = publicMainFunction.getLines;
global.getRoles = publicMainFunction.getRoles;
global.createProfessor = publicMainFunction.createProfessor;
global.updateProfessor = publicMainFunction.updateProfessor;
global.getInstitutions = publicMainFunction.getInstitutions;
global.getAccompanyingData = publicMainFunction.getAccompanyingData;
// DRIVE FUNCTIONS
global.getInstitutionsFolder = publicDriveFunctions.getInstitutionsFolder;

// SPREADSHEET FUNCTIONS
global.getSheetFromSpreadSheet = publicSheetFunctions.getSheetFromSpreadSheet;
global.getRawDataFromSheet = publicSheetFunctions.getRawDataFromSheet;
global.findText = publicSheetFunctions.findText;
global.getHeadersFromSheet = publicSheetFunctions.getHeadersFromSheet;
global.jsonToSheetValues = publicSheetFunctions.jsonToSheetValues;
global.sheetValuesToObject = publicSheetFunctions.sheetValuesToObject;
