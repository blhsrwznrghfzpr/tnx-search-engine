import { Header, SheetData, SheetRepository } from './sheet-repository';
import { Outfit, OutfitOption, OutfitSearchService } from './outfit-search.service';
jest.unmock('./outfit-search.service');

/** [row, column, val] */
type UpdateParam = [number, number, string];

class OutfitSheetMock implements SheetRepository {
  store: UpdateParam[] = [];

  getSheetData(): SheetData {
    const header: Header = {
      大分類: 0,
      小分類: 1,
      名称: 2,
      別読み: 3,
      企業: 4,
      部位: 5,
      購入目標値: 6,
      常備化経験点: 7,
      書籍: 8,
      頁: 9,
      dummy: 10,
      同名参照: 11,
    };
    const data = [
      ['武器', '白兵武器', '生身', '', '-', '-', '-', '0', 'TNX', '0', 'abcde', 'TNX0,SKD0'],
      ['武器', '射撃武器', '銃', 'ガン', '各社', '片手持ち', '3', '1', 'TNX', '1', 'cdefg', 'TNX1'],
      ['武器', '白兵武器', '生身', '', '-', '-', '-', '0', 'SKD', '0', 'efghi', 'TNX0,SKD0'],
    ];
    const content = data.map((data, id) => {
      return { id, data };
    });
    return { header, content };
  }

  updateCell(row: number, column: number, val: string): void {
    this.store.push([row, column, val]);
  }
}

const outfitSheetMock = new OutfitSheetMock();
const outfitSearchService = new OutfitSearchService(outfitSheetMock);

const nullOption: OutfitOption = {
  query: [],
  styles: [],
  majorCategories: [],
  companies: [],
  books: [],
};

describe('outfit-search.service', () => {
  describe('search()', () => {
    it('simple search', () => {
      const option: OutfitOption = {
        ...nullOption,
        query: ['cde'],
      };
      const expected: Outfit[] = [
        {
          id: 0,
          majorCategory: '武器',
          minorCategory: '白兵武器',
          name: '生身',
          ruby: '',
          part: '-',
          searchRefs: 'TNX0',
          allRefs: 'TNX0,SKD0',
        },
        {
          id: 1,
          majorCategory: '武器',
          minorCategory: '射撃武器',
          name: '銃',
          ruby: 'ガン',
          part: '片手持ち',
          searchRefs: 'TNX1',
          allRefs: 'TNX1',
        },
      ];
      const result = outfitSearchService.search(option);
      expect(result).toEqual(expected);
    });
    it('multi query search', () => {
      const option: OutfitOption = {
        ...nullOption,
        query: ['射撃 cde'],
      };
      const expected: Outfit[] = [
        {
          id: 1,
          majorCategory: '武器',
          minorCategory: '射撃武器',
          name: '銃',
          ruby: 'ガン',
          part: '片手持ち',
          searchRefs: 'TNX1',
          allRefs: 'TNX1',
        },
      ];
      const result = outfitSearchService.search(option);
      expect(result).toEqual(expected);
    });
    it('not found', () => {
      const option: OutfitOption = {
        ...nullOption,
        query: ['あああ'],
      };
      const expected: Outfit[] = [];
      const result = outfitSearchService.search(option);
      expect(result).toEqual(expected);
    });
    it('same name outfit', () => {
      const option: OutfitOption = {
        ...nullOption,
        query: ['生身'],
      };
      const expected: Outfit[] = [
        {
          id: 2,
          majorCategory: '武器',
          minorCategory: '白兵武器',
          name: '生身',
          ruby: '',
          part: '-',
          searchRefs: 'TNX0,SKD0',
          allRefs: 'TNX0,SKD0',
        },
      ];
      const result = outfitSearchService.search(option);
      expect(result).toEqual(expected);
    });
    it('book option', () => {
      const option: OutfitOption = {
        ...nullOption,
        query: ['生身'],
        books: ['TNX'],
      };
      const expected: Outfit[] = [
        {
          id: 0,
          majorCategory: '武器',
          minorCategory: '白兵武器',
          name: '生身',
          ruby: '',
          part: '-',
          searchRefs: 'TNX0',
          allRefs: 'TNX0,SKD0',
        },
      ];
      const result = outfitSearchService.search(option);
      expect(result).toEqual(expected);
    });
  });
  describe('refGroupUpdate()', () => {
    beforeEach(() => (outfitSheetMock.store = []));
    it('update', () => {
      const expected: UpdateParam[] = [
        [0, 11, 'TNX0,SKD0'],
        [2, 11, 'TNX0,SKD0'],
        [1, 11, 'TNX1'],
      ];
      outfitSearchService.refGroupUpdate();
      expect(outfitSheetMock.store).toEqual(expected);
    });
  });
});
