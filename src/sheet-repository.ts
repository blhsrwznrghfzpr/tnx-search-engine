type Header = {
  [title: string]: number;
};

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
    const firstRow = sheetData[0];
    const header = {} as Header;
    for (let i = 0; i < firstRow.length; i++) {
      const title = firstRow[i].toString();
      header[title] = i;
    }
    const content = sheetData.slice(1).map(rows => rows.map(cell => cell.toString()));
    return { header, content };
  }
}
