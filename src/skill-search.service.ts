import { SheetRepository } from './sheet-repository';

export interface Skill {
  name: string;
  style: string;
  reference: string;
}

export class SkillSearchService {
  constructor(private sheetRepository: SheetRepository) {}

  search(query: string): Skill[] {
    const sheetData = this.sheetRepository.getSheetData('技能');
    const header = sheetData.header;
    return sheetData.content
      .filter(row => row.some(cell => cell.indexOf(query) > -1))
      .map(row => {
        return {
          name: row[header['名称']],
          style: row[header['スタイル']],
          reference: row[header['参照']]
        };
      });
  }
}
