import { Factory } from 'miragejs';

export default Factory.extend({
  type: 'radio',
  perm_assign: false,
  year: (new Date()).getFullYear(),

  barcode(i) {
    return `B-${1000 + i}`;
  },

  description(i) {
    return `Asset ${i + 1}`;
  }
});
