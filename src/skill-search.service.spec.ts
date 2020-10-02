import { SheetData, SheetRepository } from './sheet-repository';
import { Skill, SkillOption, SkillSearchService } from './skill-search.service';
jest.unmock('./skill-search.service');

class SkillSheetMock implements SheetRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSheetData(_sheetName: string): SheetData {
    const header = {
      ID: 0,
      スタイル: 1,
      カテゴリ: 2,
      種別: 3,
      名称: 4,
      別読み: 5,
      参照: 6,
      dummy: 7
    };
    const content = [
      ['0', 'カブキ', '', '秘技', '技能K1', '', 'TNX0', 'abcde'],
      ['1', 'バサラ', '元力', '特技', '技能B1', 'ヨミb1', 'TNX2', 'cdefg'],
      ['2', 'タタラ', '', '特技', '技能T1', '', 'TNX3', 'efghi'],
      ['3', 'カブキ', '', '特技', '技能K2', '', 'TOS1', 'ghijk'],
      ['4', 'カブキ', '', '特技', '技能K2', '', 'CTL1', 'ijklm']
    ];
    return { header, content };
  }
}

const skillSheetMock: SheetRepository = new SkillSheetMock();
const skillSearchService = new SkillSearchService(skillSheetMock);

const nullOption: SkillOption = {
  skillTypes: []
};

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
      const result = skillSearchService.search('efg', nullOption);
      expect(result).toEqual(expected);
    });
    it('multi query search', () => {
      const expected: Skill[] = [
        { id: 3, name: '技能K2', ruby: '', style: 'カブキ', category: '', reference: 'TOS1' }
      ];
      const result = skillSearchService.search('カブキ hij', nullOption);
      expect(result).toEqual(expected);
    });
    it('not found', () => {
      const expected: Skill[] = [];
      const result = skillSearchService.search('あああ', nullOption);
      expect(result).toEqual(expected);
    });
    it('same name skill', () => {
      const expected: Skill[] = [
        { id: 3, name: '技能K2', ruby: '', style: 'カブキ', category: '', reference: 'TOS1,CTL1' }
      ];
      const result = skillSearchService.search('技能K2', nullOption);
      expect(result).toEqual(expected);
    });
    it('skillType option', () => {
      const option: SkillOption = {
        skillTypes: ['秘技']
      };
      const expected: Skill[] = [
        { id: 0, name: '技能K1', ruby: '', style: 'カブキ', category: '', reference: 'TNX0' }
      ];
      const result = skillSearchService.search('カブキ', option);
      expect(result).toEqual(expected);
    });
  });
});
