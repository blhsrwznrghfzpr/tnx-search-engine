import { Header, Row, SheetRepository } from './sheet-repository';
import { containWords, groupBy } from './util';

export type Skill = {
  id: number;
  name: string;
  ruby: string;
  style: string;
  category: string;
  searchRefs: string;
  allRefs: string;
};

export type SkillOption = {
  query: string[];
  styles: string[];
  skillTypes: string[];
  books: string[];
};

export class SkillSearchService {
  private readonly header: Header;
  private readonly content: Row[];

  constructor(private sheetRepository: SheetRepository) {
    const sheetData = this.sheetRepository.getSheetData();
    this.header = sheetData.header;
    this.content = sheetData.content;
  }

  search(option: SkillOption): Skill[] {
    const words = option.query.join(' ').split(/\s+/g);
    const result = this.content
      .filter((row) => this.filter(row, words, option))
      .map(this.row2skill);
    return groupBy(result, SkillSearchService.groupKey).map(
      (group): Skill => {
        return {
          ...group[0],
          searchRefs: group.map((skill) => skill.searchRefs).join(','),
        };
      }
    );
  }

  private filter(row: Row, words: string[], option: SkillOption): boolean {
    const style = row.data[this.header['スタイル']];
    if (option.styles.length > 0 && option.styles.indexOf(style) < 0) {
      return false;
    }
    const skillType = row.data[this.header['種別']];
    if (option.skillTypes.length > 0 && option.skillTypes.indexOf(skillType) < 0) {
      return false;
    }
    const book = row.data[this.header['書籍']];
    if (option.books.length > 0 && option.books.indexOf(book) < 0) {
      return false;
    }
    return containWords(row.data, words);
  }

  private row2skill = (row: Row): Skill => {
    const book = row.data[this.header['書籍']];
    const page = row.data[this.header['頁']];
    return {
      id: row.id,
      name: row.data[this.header['名称']],
      ruby: row.data[this.header['別読み']],
      style: row.data[this.header['スタイル']],
      category: row.data[this.header['カテゴリ']],
      searchRefs: `${book}${page}`,
      allRefs: row.data[this.header['同名参照']],
    };
  };

  private static groupKey = (skill: Skill) =>
    `${skill.name}+${skill.ruby}+${skill.style}+${skill.category}`;

  refGroupUpdate(): void {
    const data = this.content.map(this.row2skill);
    const columnIdx = this.header['同名参照'];
    groupBy(data, SkillSearchService.groupKey).forEach((group) => {
      const allRefs = group.map((skill) => skill.searchRefs).join(',');
      group.forEach((skill) => this.sheetRepository.updateCell(skill.id, columnIdx, allRefs));
    });
  }
}
