/**
 * Returns an array containing the elements in the original
 * array split into at most groupCount smaller arrays.
 */
export default function inGroups(array, groupCount, balanced) {

  if (groupCount < 2)
    return [array];

  const len  = array.length;
  const groups = [];
  let i = 0, size;

  if (len % groupCount === 0) {
    size = Math.floor(len / groupCount);
    while (i < len) {
      groups.push(array.slice(i, i += size));
    }

    return groups;
  }

  if (balanced) {
    while (i < len) {
      size = Math.ceil((len - i) / groupCount--);
      groups.push(array.slice(i, i += size));
    }

    return groups;
  }

  groupCount--;
  size = Math.floor(len / groupCount);
  if (len % size === 0)
    size--;

  while (i < size * groupCount) {
    groups.push(array.slice(i, i += size));
  }
  groups.push(array.slice(size * groupCount));

  return groups;
}
