import { helper } from '@ember/component/helper';
import dayjs from 'dayjs';

/*
 * Take datetime (yyyy-mm-dd hh:mm:ss) and return just the year
 */

export function yearFormat([ date ]/*, hash*/) {
  let year;

  if (!date) {
    return '';
  }

  try {
    year = dayjs(date).format('YYYY');
  } catch (exception) {
    return 'err '+exception;
  }

  return year;
}

export default helper(yearFormat);
