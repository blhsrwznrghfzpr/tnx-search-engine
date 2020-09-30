export const containWords = (row: string[], words: string[]): boolean =>
  words.every(word => row.some(cell => cell.indexOf(word) >= 0));

export const groupBy = <K extends PropertyKey, V>(
  array: readonly V[],
  getKey: (cur: V, idx: number, src: readonly V[]) => K
): V[][] => {
  const [keys, obj] = array.reduce(
    ([keys, obj], cur, idx, arr) => {
      const key = getKey(cur, idx, arr);
      if (obj[key]) obj[key].push(cur);
      else {
        obj[key] = [cur];
        keys.push(key);
      }
      return [keys, obj];
    },
    ([[], {}] as unknown) as [K[], Record<K, V[]>]
  );
  return keys.map(key => obj[key]);
};
