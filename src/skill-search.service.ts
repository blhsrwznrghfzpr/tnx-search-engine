import { SheetRepository } from './sheet-repository';

export interface Skill {
  name: string;
  ruby: string;
  style: string;
  reference: string;
}

export class SkillSearchService {
  constructor(private sheetRepository: SheetRepository) {}

  search(query: string): Skill[] {
    const sheetData = this.sheetRepository.getSheetData('技能');
    const header = sheetData.header;

    const words = query.split(/\s+/g);
    return sheetData.content
      .filter(row => SkillSearchService.containWords(row, words))
      .map(row => {
        const style = row[header['スタイル']];
        const category = row[header['カテゴリ']];
        return {
          name: row[header['名称']],
          ruby: row[header['別読み']],
          style: category ? `${style}：${category}` : style,
          reference: row[header['参照']]
        };
      });
  }

  static containWords(row: string[], words: string[]): boolean {
    return words.every(word => row.some(cell => cell.indexOf(word) >= 0));
  }
}
