import {helper} from '@ember/component/helper';
import moment from 'moment';

const MONTH_DAY_TIME = 'ddd MMM DD [@] HH:mm';
const MONTH_DAY_TIME_YEAR = 'ddd MMM DD [@] HH:mm YY';
//const DAY_TIME = 'ddd [@] HH:mm';
const HOUR_MINS = 'HH:mm';

export function shiftFormat([shiftDate, toDate], hash) {
  let datetime;

  if (!shiftDate) {
    return '';
  }

  datetime = moment(shiftDate);
  if (!datetime.isValid()) {
    return shiftDate;
  }

  if (!toDate) {
    return datetime.format(hash.year ? MONTH_DAY_TIME_YEAR : MONTH_DAY_TIME);
  }

  const toDt = moment(toDate);
  if (!toDt.isValid()) {
    return datetime.format(MONTH_DAY_TIME);

  }


  return  datetime.format(hash.year ? MONTH_DAY_TIME_YEAR : MONTH_DAY_TIME) + ' to ' + toDt.format(hash.year ? MONTH_DAY_TIME_YEAR : HOUR_MINS);
}

export default helper(shiftFormat);
