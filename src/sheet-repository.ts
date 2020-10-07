export type Header = Record<string, number>;

export type SheetData = {
  header: Header;
  content: string[][];
};

export interface SheetRepository {
  getSheetData(): SheetData;
}

export class SpreadsheetRepository implements SheetRepository {
  private readonly sheetName: string;

  constructor(sheetName: string) {
    this.sheetName = sheetName;
  }

  getSheetData(): SheetData {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.sheetName);
    if (!sheet) {
      throw Error(`sheet is not found. sheetName=${this.sheetName}`);
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
