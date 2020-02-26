import { helper } from '@ember/component/helper';
import moment from 'moment';

export function shiftFormat([ shiftDate ], hash) {
  let datetime;

  if (!shiftDate) {
    return '';
  }

  try {
    datetime = moment(shiftDate).format(hash.year ? 'ddd MMM DD [@] HH:mm YY' : 'ddd MMM DD [@] HH:mm' );
  } catch (exception) {
    return 'err '+exception;
  }

  return datetime;
}

export default helper(shiftFormat);
