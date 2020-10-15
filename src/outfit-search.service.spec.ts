import { Header, SheetData, SheetRepository } from './sheet-repository';
import { Outfit, OutfitOption, OutfitSearchService } from './outfit-search.service';
jest.unmock('./outfit-search.service');

/** [row, column, val] */
type UpdateParam = [number, number, string];

class OutfitSheetMock implements SheetRepository {
  store: UpdateParam[] = [];

  getSheetData(): SheetData {
    const header: Header = {
      ID: 0,
      大分類: 1,
      小分類: 2,
      名称: 3,
      別読み: 4,
      企業: 5,
      部位: 6,
      購入レート: 7,
      常備化レート: 8,
      書籍: 9,
      頁: 10,
      dummy: 11,
      同名参照: 12,
    };
    const content = [
      ['0', '武器', '白兵武器', '生身', '', '-', '-', '-', '0', 'TNX', '0', 'abcde', 'TNX0,SKD0'],
      [
        '1',
        '武器',
        '射撃武器',
        '銃',
        'ガン',
        '各社',
        '片手持ち',
        '3',
        '1',
        'TNX',
        '1',
        'cdefg',
        'TNX1',
      ],
      ['2', '武器', '白兵武器', '生身', '', '-', '-', '-', '0', 'SKD', '0', 'efghi', 'TNX0,SKD0'],
    ];
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
        [1, 13, 'TNX0,SKD0'],
        [3, 13, 'TNX0,SKD0'],
        [2, 13, 'TNX1'],
      ];
      outfitSearchService.refGroupUpdate();
      expect(outfitSheetMock.store).toEqual(expected);
    });
  });
});
