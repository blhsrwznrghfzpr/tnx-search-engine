export type Header = Record<string, number>;

export type SheetData = {
  header: Header;
  content: string[][];
};

export interface SheetRepository {
  getSheetData(sheetName: string): SheetData;
}

export class SpreadsheetRepository implements SheetRepository {
  getSheetData(sheetName: string): SheetData {
    return SpreadsheetRepository._getSheetData(sheetName);
  }

  private static _getSheetData(sheetName: string): SheetData {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw Error(`sheet is not found. sheetName=${sheetName}`);
    }
    const sheetData = sheet.getDataRange().getValues();
    const header = sheetData[0]
      .map((val) => val.toString() as string)
      .reduce((obj, val, idx) => {
        obj[val] = idx;
        return obj;
      }, {} as Header);
    const content = sheetData.slice(1).map((row) => row.map((val) => val.toString() as string));
    return { header, content };
  }
}
