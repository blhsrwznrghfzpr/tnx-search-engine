import { SheetData, SheetRepository } from './sheet-repository';
import { Skill, SkillSearchService } from './skill-search.service';
jest.unmock('./skill-search.service');

class SkillSheetMock implements SheetRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSheetData(_sheetName: string): SheetData {
    const header = {
      スタイル: 0,
      カテゴリ: 1,
      名称: 2,
      別読み: 3,
      参照: 4,
      dummy: 5
    };
    const content = [
      ['カブキ', '', '技能K1', '', 'TNX0', 'abcde'],
      ['バサラ', '', '技能B1', 'ヨミb1', 'TNX2', 'cdefg'],
      ['タタラ', '', '技能T1', '', 'TNX3', 'efghi'],
      ['カブキ', '', '技能K2', '', 'TOS1', 'ghijk'],
      ['バサラ', '元力', '技能B2', '', 'TNX4', 'ijklm']
    ];
    return { header, content };
  }
}

const skillSheetMock: SheetRepository = new SkillSheetMock();
const skillSearchService = new SkillSearchService(skillSheetMock);
describe('skill-search.service', () => {
  describe('containWords()', () => {
    it('contain', () => {
      const row = ['foo', 'bar', 'baz'];
      const words = ['fo', 'az'];
      expect(SkillSearchService.containWords(row, words)).toBe(true);
    });
    it('not contain', () => {
      const row = ['foo', 'bar', 'baz'];
      const words = ['fo', 'qux'];
      expect(SkillSearchService.containWords(row, words)).toBe(false);
    });
  });
  describe('search()', () => {
    it('simple search', () => {
      const expected: Skill[] = [
        { name: '技能B1', ruby: 'ヨミb1', style: 'バサラ', reference: 'TNX2' },
        { name: '技能T1', ruby: '', style: 'タタラ', reference: 'TNX3' }
      ];
      const result = skillSearchService.search('efg');
      expect(result).toEqual(expected);
    });
    it('multi query search', () => {
      const expected: Skill[] = [{ name: '技能K2', ruby: '', style: 'カブキ', reference: 'TOS1' }];
      const result = skillSearchService.search('カブキ hij');
      expect(result).toEqual(expected);
    });
    it('exist category', () => {
      const expected: Skill[] = [
        { name: '技能B2', ruby: '', style: 'バサラ：元力', reference: 'TNX4' }
      ];
      const result = skillSearchService.search('元力');
      expect(result).toEqual(expected);
    });
  });
});
