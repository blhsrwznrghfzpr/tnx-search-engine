import { Header, SheetRepository } from './sheet-repository';
import { containWords, groupBy } from './util';

export type Skill = {
  id: number;
  name: string;
  ruby: string;
  style: string;
  category: string;
  reference: string;
};

export type SkillOption = {
  styles: string[];
  skillTypes: string[];
  books: string[];
};

export class SkillSearchService {
  private readonly header: Header;
  private readonly content: string[][];

  constructor(private sheetRepository: SheetRepository) {
    const sheetData = this.sheetRepository.getSheetData();
    this.header = sheetData.header;
    this.content = sheetData.content;
  }

  search(query: string, option: SkillOption): Skill[] {
    const words = query.split(/\s+/g);
    const result = this.content
      .filter((row) => this.filter(row, words, option))
      .map(this.row2skill);
    return groupBy(result, SkillSearchService.groupKey).map(
      (group): Skill => {
        return {
          ...group[0],
          reference: group.map((skill) => skill.reference).join(','),
        };
      }
    );
  }

  private filter(row: string[], words: string[], option: SkillOption): boolean {
    const style = row[this.header['スタイル']];
    if (option.styles.length > 0 && option.styles.indexOf(style) < 0) {
      return false;
    }
    const skillType = row[this.header['種別']];
    if (option.skillTypes.length > 0 && option.skillTypes.indexOf(skillType) < 0) {
      return false;
    }
    const book = row[this.header['書籍']];
    if (option.books.length > 0 && option.books.indexOf(book) < 0) {
      return false;
    }
    return containWords(row, words);
  }

  private row2skill = (row: string[]) => {
    const book = row[this.header['書籍']];
    const page = row[this.header['頁']];
    return {
      id: parseInt(row[this.header['ID']]),
      name: row[this.header['名称']],
      ruby: row[this.header['別読み']],
      style: row[this.header['スタイル']],
      category: row[this.header['カテゴリ']],
      reference: `${book}${page}`,
    };
  };

  private static groupKey = (skill: Skill) =>
    `${skill.name}+${skill.ruby}+${skill.style}+${skill.category}`;

  refGroupUpdate(): void {
    const data = this.content.map(this.row2skill);
    const column = 1 + this.header['同名参照'];
    groupBy(data, SkillSearchService.groupKey).forEach((group) => {
      const refs = group.map((skill) => skill.reference).join(',');
      group.forEach((skill) => this.sheetRepository.updateCell(1 + skill.id, column, refs));
    });
  }
}
