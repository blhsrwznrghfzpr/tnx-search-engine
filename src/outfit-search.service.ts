import { Header, Row, SheetRepository } from './sheet-repository';
import { containWords, groupBy } from './util';

export type Outfit = {
  id: number;
  majorCategory: string;
  minorCategory: string;
  name: string;
  ruby: string;
  part: string;
  searchRefs: string;
  allRefs: string;
};

export type OutfitOption = {
  query: string[];
  styles: string[];
  majorCategories: string[];
  companies: string[];
  books: string[];
};

export class OutfitSearchService {
  private readonly header: Header;
  private readonly content: Row[];

  constructor(private sheetRepository: SheetRepository) {
    const sheetData = this.sheetRepository.getSheetData();
    this.header = sheetData.header;
    this.content = sheetData.content;
  }

  search(option: OutfitOption): Outfit[] {
    const words = option.query.join(' ').split(/\s+/g);
    const result = this.content
      .filter((row) => this.filter(row, words, option))
      .map(this.row2skill);
    return groupBy(result, OutfitSearchService.groupKey).map(
      (group): Outfit => {
        return {
          ...group[group.length - 1],
          searchRefs: group.map((skill) => skill.searchRefs).join(','),
        };
      }
    );
  }

  private filter(row: Row, words: string[], option: OutfitOption): boolean {
    // const style = row.data[this.header['スタイル']];
    // if (option.styles.length > 0 && option.styles.indexOf(style) < 0) {
    //   return false;
    // }
    // const skillType = row.data[this.header['種別']];
    // if (option.companies.length > 0 && option.companies.indexOf(skillType) < 0) {
    //   return false;
    // }
    const book = row.data[this.header['書籍']];
    if (option.books.length > 0 && option.books.indexOf(book) < 0) {
      return false;
    }
    return containWords(row.data, words);
  }

  private row2skill = (row: Row): Outfit => {
    const book = row.data[this.header['書籍']];
    const page = row.data[this.header['頁']];
    return {
      id: row.id,
      majorCategory: row.data[this.header['大分類']],
      minorCategory: row.data[this.header['小分類']],
      name: row.data[this.header['名称']],
      ruby: row.data[this.header['別読み']],
      part: row.data[this.header['部位']],
      searchRefs: `${book}${page}`,
      allRefs: row.data[this.header['同名参照']],
    };
  };

  private static groupKey = (outfit: Outfit) => outfit.name;

  refGroupUpdate(): void {
    const data = this.content.map(this.row2skill);
    const columnIdx = this.header['同名参照'];
    groupBy(data, OutfitSearchService.groupKey).forEach((group) => {
      const allRefs = group.map((outfit) => outfit.searchRefs).join(',');
      group.forEach((outfit) => this.sheetRepository.updateCell(outfit.id, columnIdx, allRefs));
    });
  }
}
