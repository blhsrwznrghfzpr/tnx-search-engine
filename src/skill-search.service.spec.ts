import { SheetData, SheetRepository } from './sheet-repository';
import { Skill, SkillSearchService } from './skill-search.service';
jest.unmock('./skill-search.service');

class SkillSheetMock implements SheetRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSheetData(_sheetName: string): SheetData {
    const header = {
      ID: 0,
      スタイル: 1,
      カテゴリ: 2,
      名称: 3,
      別読み: 4,
      参照: 5,
      dummy: 6
    };
    const content = [
      ['0', 'カブキ', '', '技能K1', '', 'TNX0', 'abcde'],
      ['1', 'バサラ', '元力', '技能B1', 'ヨミb1', 'TNX2', 'cdefg'],
      ['2', 'タタラ', '', '技能T1', '', 'TNX3', 'efghi'],
      ['3', 'カブキ', '', '技能K2', '', 'TOS1', 'ghijk'],
      ['4', 'カブキ', '', '技能K2', '', 'CTL1', 'ijklm']
    ];
    return { header, content };
  }
}

const skillSheetMock: SheetRepository = new SkillSheetMock();
const skillSearchService = new SkillSearchService(skillSheetMock);
describe('skill-search.service', () => {
  describe('search()', () => {
    it('simple search', () => {
      const expected: Skill[] = [
        {
          id: 1,
          name: '技能B1',
          ruby: 'ヨミb1',
          style: 'バサラ',
          category: '元力',
          reference: 'TNX2'
        },
        { id: 2, name: '技能T1', ruby: '', style: 'タタラ', category: '', reference: 'TNX3' }
      ];
      const result = skillSearchService.search('efg');
      expect(result).toEqual(expected);
    });
    it('multi query search', () => {
      const expected: Skill[] = [
        { id: 3, name: '技能K2', ruby: '', style: 'カブキ', category: '', reference: 'TOS1' }
      ];
      const result = skillSearchService.search('カブキ hij');
      expect(result).toEqual(expected);
    });
    it('not found', () => {
      const expected: Skill[] = [];
      const result = skillSearchService.search('あああ');
      expect(result).toEqual(expected);
    });
    it('same name skill', () => {
      const expected: Skill[] = [
        { id: 3, name: '技能K2', ruby: '', style: 'カブキ', category: '', reference: 'TOS1,CTL1' }
      ];
      const result = skillSearchService.search('技能K2');
      expect(result).toEqual(expected);
    });
  });
});
