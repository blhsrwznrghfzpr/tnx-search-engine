import { Header, SheetRepository } from './sheet-repository';
import { containWords, groupBy } from './util';

export interface Skill {
  id: number;
  name: string;
  ruby: string;
  style: string;
  category: string;
  reference: string;
}

export type SkillOption = {
  styles: string[];
  skillTypes: string[];
  books: string[];
};

export class SkillSearchService {
  constructor(private sheetRepository: SheetRepository) {}

  search(query: string, option: SkillOption): Skill[] {
    const sheetData = this.sheetRepository.getSheetData('技能');
    const header = sheetData.header;

    const words = query.split(/\s+/g);
    const result = sheetData.content
      .filter(row => SkillSearchService.filter(row, words, header, option))
      .map(
        (row): Skill => {
          const book = row[header['書籍']];
          const page = row[header['頁']];
          return {
            id: parseInt(row[header['ID']]),
            name: row[header['名称']],
            ruby: row[header['別読み']],
            style: row[header['スタイル']],
            category: row[header['カテゴリ']],
            reference: `${book}${page}`
          };
        }
      );
    return groupBy(result, val => `${val.name}+${val.ruby}+${val.style}+${val.category}`).map(
      (group): Skill => {
        return {
          ...group[0],
          reference: group.map(skill => skill.reference).join(',')
        };
      }
    );
  }

  private static filter(
    row: string[],
    words: string[],
    header: Header,
    option: SkillOption
  ): boolean {
    const style = row[header['スタイル']];
    if (option.styles.length > 0 && option.styles.indexOf(style) < 0) {
      return false;
    }
    const skillType = row[header['種別']];
    if (option.skillTypes.length > 0 && option.skillTypes.indexOf(skillType) < 0) {
      return false;
    }
    const book = row[header['書籍']];
    if (option.books.length > 0 && option.books.indexOf(book) < 0) {
      return false;
    }
    return containWords(row, words);
  }
}
