export default function groupBy(items, key) {
  const groups = [];

  if (items == null) {
    return groups;
  }

  items.forEach((item) => {
    const value = item[key];
    let group = groups.find((g) => g[key] === value);

    if (group) {
      group.items.push(item);
    } else {
      groups.push({ [key]: value, items: [item] });
    }
  });

  return groups;
}
