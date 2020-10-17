import { Header, SheetData, SheetRepository } from './sheet-repository';
import { Skill, SkillOption, SkillSearchService } from './skill-search.service';
jest.unmock('./skill-search.service');

/** [row, column, val] */
type UpdateParam = [number, number, string];

class SkillSheetMock implements SheetRepository {
  store: UpdateParam[] = [];

  getSheetData(): SheetData {
    const header: Header = {
      スタイル: 0,
      カテゴリ: 1,
      種別: 2,
      名称: 3,
      別読み: 4,
      書籍: 5,
      頁: 6,
      dummy: 7,
      同名参照: 8,
    };
    const data = [
      ['カブキ', '', '秘技', '技能K1', '', 'TNX', '0', 'abcde', 'TNX0'],
      ['バサラ', '元力', '特技', '技能B1', 'ヨミb1', 'TNX', '2', 'cdefg', 'TNX2,CTL2'],
      ['タタラ', '', '特技', '技能T1', '', 'TNX', '3', 'efghi', 'TNX3'],
      ['カブキ', '', '特技', '技能K2', '', 'TOS', '1', 'ghijk', 'TOS1,CTL1'],
      ['カブキ', '', '特技', '技能K2', '', 'CTL', '1', 'ijklm', 'TOS1,CTL1'],
      ['バサラ', '元力', '特技', '技能B1', 'ヨミb1', 'CTL', '2', 'klmno', 'TNX2,CTL2'],
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

const skillSheetMock = new SkillSheetMock();
const skillSearchService = new SkillSearchService(skillSheetMock);

const nullOption: SkillOption = {
  query: [],
  styles: [],
  skillTypes: [],
  books: [],
};

describe('skill-search.service', () => {
  describe('search()', () => {
    it('simple search', () => {
      const option: SkillOption = {
        ...nullOption,
        query: ['efg'],
      };
      const expected: Skill[] = [
        {
          id: 1,
          name: '技能B1',
          ruby: 'ヨミb1',
          style: 'バサラ',
          category: '元力',
          searchRefs: 'TNX2',
          allRefs: 'TNX2,CTL2',
        },
        {
          id: 2,
          name: '技能T1',
          ruby: '',
          style: 'タタラ',
          category: '',
          searchRefs: 'TNX3',
          allRefs: 'TNX3',
        },
      ];
      const result = skillSearchService.search(option);
      expect(result).toEqual(expected);
    });
    it('multi query search', () => {
      const option: SkillOption = {
        ...nullOption,
        query: ['カブキ klm'],
      };
      const expected: Skill[] = [
        {
          id: 4,
          name: '技能K2',
          ruby: '',
          style: 'カブキ',
          category: '',
          searchRefs: 'CTL1',
          allRefs: 'TOS1,CTL1',
        },
      ];
      const result = skillSearchService.search(option);
      expect(result).toEqual(expected);
    });
    it('not found', () => {
      const option: SkillOption = {
        ...nullOption,
        query: ['あああ'],
      };
      const expected: Skill[] = [];
      const result = skillSearchService.search(option);
      expect(result).toEqual(expected);
    });
    it('same name skill', () => {
      const option: SkillOption = {
        ...nullOption,
        query: ['技能K2'],
      };
      const expected: Skill[] = [
        {
          id: 3,
          name: '技能K2',
          ruby: '',
          style: 'カブキ',
          category: '',
          searchRefs: 'TOS1,CTL1',
          allRefs: 'TOS1,CTL1',
        },
      ];
      const result = skillSearchService.search(option);
      expect(result).toEqual(expected);
    });
    it('style option', () => {
      const option: SkillOption = {
        ...nullOption,
        query: ['efg'],
        styles: ['タタラ'],
      };
      const expected: Skill[] = [
        {
          id: 2,
          name: '技能T1',
          ruby: '',
          style: 'タタラ',
          category: '',
          searchRefs: 'TNX3',
          allRefs: 'TNX3',
        },
      ];
      const result = skillSearchService.search(option);
      expect(result).toEqual(expected);
    });
    it('style option and empty query', () => {
      const option: SkillOption = {
        ...nullOption,
        styles: ['バサラ', 'タタラ'],
      };
      const expected: Skill[] = [
        {
          id: 1,
          name: '技能B1',
          ruby: 'ヨミb1',
          style: 'バサラ',
          category: '元力',
          searchRefs: 'TNX2,CTL2',
          allRefs: 'TNX2,CTL2',
        },
        {
          id: 2,
          name: '技能T1',
          ruby: '',
          style: 'タタラ',
          category: '',
          searchRefs: 'TNX3',
          allRefs: 'TNX3',
        },
      ];
      const result = skillSearchService.search(option);
      expect(result).toEqual(expected);
    });
    it('skillType option', () => {
      const option: SkillOption = {
        ...nullOption,
        query: ['カブキ'],
        skillTypes: ['秘技'],
      };
      const expected: Skill[] = [
        {
          id: 0,
          name: '技能K1',
          ruby: '',
          style: 'カブキ',
          category: '',
          searchRefs: 'TNX0',
          allRefs: 'TNX0',
        },
      ];
      const result = skillSearchService.search(option);
      expect(result).toEqual(expected);
    });
    it('book option', () => {
      const option: SkillOption = {
        ...nullOption,
        query: ['カブキ'],
        books: ['CTL'],
      };
      const expected: Skill[] = [
        {
          id: 4,
          name: '技能K2',
          ruby: '',
          style: 'カブキ',
          category: '',
          searchRefs: 'CTL1',
          allRefs: 'TOS1,CTL1',
        },
      ];
      const result = skillSearchService.search(option);
      expect(result).toEqual(expected);
    });
  });
  describe('refGroupUpdate()', () => {
    beforeEach(() => (skillSheetMock.store = []));
    it('update', () => {
      const expected: UpdateParam[] = [
        [0, 8, 'TNX0'],
        [1, 8, 'TNX2,CTL2'],
        [5, 8, 'TNX2,CTL2'],
        [2, 8, 'TNX3'],
        [3, 8, 'TOS1,CTL1'],
        [4, 8, 'TOS1,CTL1'],
      ];
      skillSearchService.refGroupUpdate();
      expect(skillSheetMock.store).toEqual(expected);
    });
  });
});
