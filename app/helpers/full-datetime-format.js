import { helper } from '@ember/component/helper';
import moment from 'moment';

export function fullDatetimeFormat([ date ]/*, hash*/) {
  if (!date) {
    return '';
  }

  try {
    return moment(date).format('dddd, MMMM Do YYYY @ HH:mm');
  } catch (exception) {
    return `invalid date [${date}]`;
  }
}

export default helper(fullDatetimeFormat);
