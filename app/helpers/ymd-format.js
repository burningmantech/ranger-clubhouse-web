import { helper } from '@ember/component/helper';
import moment from 'moment';

// Show a date at YYYY-MM-DD

export function ymdFormat([ date ]) {
  return moment(date).format('YYYY-MM-DD');
}

export default helper(ymdFormat);
