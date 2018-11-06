import { helper } from '@ember/component/helper';
import moment from 'moment';

export function shiftFormat([ shiftDate ]) {
  let datetime;

  if (!shiftDate) {
    return '';
  }

  try {
    datetime = moment(shiftDate).format('ddd MMM DD [@] HH:mm');
  } catch (exception) {
    return 'err '+exception;
  }

  return datetime;
}

export default helper(shiftFormat);
