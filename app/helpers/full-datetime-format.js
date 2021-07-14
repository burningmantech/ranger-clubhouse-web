import { helper } from '@ember/component/helper';
import dayjs from 'dayjs';

export function fullDatetimeFormat([ date ]/*, hash*/) {
  if (!date) {
    return '';
  }

  try {
    return dayjs(date).format('dddd, MMMM Do YYYY @ HH:mm');
  } catch (exception) {
    return `invalid date [${date}]`;
  }
}

export default helper(fullDatetimeFormat);
