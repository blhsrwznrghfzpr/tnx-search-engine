import { containWords, groupBy } from './util';
jest.unmock('./util');

describe('util', () => {
  describe('containWords()', () => {
    it('contain', () => {
      const row = ['foo', 'bar', 'baz'];
      const words = ['fo', 'az'];
      expect(containWords(row, words)).toBe(true);
    });
    it('not contain', () => {
      const row = ['foo', 'bar', 'baz'];
      const words = ['fo', 'qux'];
      expect(containWords(row, words)).toBe(false);
    });
  });
  describe('groupBy()', () => {
    it('normal', () => {
      const arr = [
        { id: 1, name: 'foo' },
        { id: 2, name: 'bar' },
        { id: 3, name: 'baz' },
        { id: 2, name: 'qux' },
        { id: 1, name: 'quux' }
      ];
      const getKey = (val: { id: number; name: string }): number => val.id;
      const expected = [
        [
          { id: 1, name: 'foo' },
          { id: 1, name: 'quux' }
        ],
        [
          { id: 2, name: 'bar' },
          { id: 2, name: 'qux' }
        ],
        [{ id: 3, name: 'baz' }]
      ];
      expect(groupBy(arr, getKey)).toStrictEqual(expected);
    });
  });
});
