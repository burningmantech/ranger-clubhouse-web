import { helper } from '@ember/component/helper';
import dayjs from 'dayjs';

// Show a date at YYYY-MM-DD

export function ymdFormat([ date ]) {
  return dayjs(date).format('YYYY-MM-DD');
}

export default helper(ymdFormat);
