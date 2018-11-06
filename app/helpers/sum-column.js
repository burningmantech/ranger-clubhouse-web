import { helper } from '@ember/component/helper';
import { typeOf } from '@ember/utils';

export function sumColumn([ rows, column ]/*, hash*/) {
  if (!rows) {
    return 0;
  }

  return rows.reduce(function(total, row) {
    if (typeOf(row) == 'object') {
      return row[column] + total;
    } else {
      return row.get(column) + total;
    }
  }, 0);
}

export default helper(sumColumn);
