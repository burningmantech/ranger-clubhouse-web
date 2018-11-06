export default function inGroups(array, groupCount) {
  const arrayLength = array.length;

  const groups = [];

  const size = (arrayLength + (groupCount - 1))/groupCount;

  for (let i = 0; i < arrayLength; i += size) {
    groups.push(array.slice(i, i+size));
  }

  return groups;
}
