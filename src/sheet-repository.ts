export type Header = Record<string, number>;

export type Row = {
  id: number;
  data: string[];
};

export type SheetData = {
  header: Header;
  content: Row[];
};

export interface SheetRepository {
  getSheetData(): SheetData;
  updateCell(row: number, col: number, val: string): void;
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
    const content: Row[] = sheetData
      .slice(1)
      .map((row) => row.map((val) => val.toString() as string))
      .map((data, id) => {
        // 1行目はヘッダなため
        return { id: id + 1, data };
      });
    return { header, content };
  }

  /**
   * @param rowIdx 0始まりインデックス
   * @param columnIdx 0始まりインデックス
   * @param val
   */
  updateCell(rowIdx: number, columnIdx: number, val: string): void {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.sheetName);
    if (!sheet) {
      throw Error(`sheet is not found. sheetName=${this.sheetName}`);
    }
    // 1始まりインデックスに変換
    const cell = sheet.getRange(rowIdx + 1, columnIdx + 1);
    cell.setValue(val);
  }
}
