import { Header, SheetRepository } from './sheet-repository';
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
  styles: string[];
  majorCategories: string[];
  companies: string[];
  books: string[];
};

export class OutfitSearchService {
  private readonly header: Header;
  private readonly content: string[][];

  constructor(private sheetRepository: SheetRepository) {
    const sheetData = this.sheetRepository.getSheetData();
    this.header = sheetData.header;
    this.content = sheetData.content;
  }

  search(query: string, option: OutfitOption): Outfit[] {
    const words = query.split(/\s+/g);
    const result = this.content
      .filter((row) => this.filter(row, words, option))
      .map(this.row2skill);
    return groupBy(result, OutfitSearchService.groupKey).map(
      (group): Outfit => {
        return {
          ...group[0],
          searchRefs: group.map((skill) => skill.searchRefs).join(','),
        };
      }
    );
  }

  private filter(row: string[], words: string[], option: OutfitOption): boolean {
    const book = row[this.header['書籍']];
    if (option.books.length > 0 && option.books.indexOf(book) < 0) {
      return false;
    }
    return containWords(row, words);
  }

  private row2skill = (row: string[]): Outfit => {
    const book = row[this.header['書籍']];
    const page = row[this.header['頁']];
    return {
      id: parseInt(row[this.header['ID']]),
      majorCategory: row[this.header['大分類']],
      minorCategory: row[this.header['小分類']],
      name: row[this.header['名称']],
      ruby: row[this.header['別読み']],
      part: row[this.header['部位']],
      searchRefs: `${book}${page}`,
      allRefs: row[this.header['同名参照']],
    };
  };

  private static groupKey = (outfit: Outfit) => outfit.name;

  refGroupUpdate(): void {
    const data = this.content.map(this.row2skill);
    const column = 1 + this.header['同名参照'];
    groupBy(data, OutfitSearchService.groupKey).forEach((group) => {
      const allRefs = group.map((outfit) => outfit.searchRefs).join(',');
      group.forEach((outfit) => this.sheetRepository.updateCell(1 + outfit.id, column, allRefs));
    });
  }
}
