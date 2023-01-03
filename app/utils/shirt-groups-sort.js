import _ from "lodash";

function buildShirts(people, column) {
  return _.sortBy(
    _.map(_.groupBy(people, column), (group, type) => ({type, count: group.length})),
    'type');
}

export default function shirtGroupsSort(people) {
  return [
    {
      name: 'Tee Shirts',
      exportName: 'tee-shirts',
      types: buildShirts(people, 'teeshirt_size_style')
    },
    {
      name: 'Tee Shirts Backup',
      exportName: 'tee-shirts-secondary',
      types: buildShirts(people, 'tshirt_secondary_size')
    },
    {
      name: 'Long Sleeves',
      exportName: 'long-sleeves',
      types: buildShirts(people, 'longsleeveshirt_size_style')
    }
  ];
}
