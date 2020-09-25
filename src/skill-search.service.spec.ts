import { SheetData, SheetRepository } from './sheet-repository';
import { Skill, SkillSearchService } from './skill-search.service';
jest.unmock('./skill-search.service');

class SkillSheetMock implements SheetRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSheetData(_sheetName: string): SheetData {
    const header = {
      名称: 0,
      スタイル: 1,
      参照: 2,
      dummy: 3
    };
    const content = [
      ['技能K1', 'カブキ', 'TNX0', 'abcde'],
      ['技能B1', 'バサラ', 'TNX2', 'cdefg'],
      ['技能T1', 'タタラ', 'TNX3', 'efghi'],
      ['技能K2', 'カブキ', 'TOS1', 'ghijk']
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
        { name: '技能B1', style: 'バサラ', reference: 'TNX2' },
        { name: '技能T1', style: 'タタラ', reference: 'TNX3' }
      ];
      const result = skillSearchService.search('efg');
      expect(result).toEqual(expected);
    });
  });
});
