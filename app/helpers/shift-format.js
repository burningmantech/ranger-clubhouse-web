import {helper} from '@ember/component/helper';
import moment from 'moment';

const MONTH_DAY_TIME = 'ddd MMM DD [@] HH:mm';
const MONTH_DAY_TIME_YEAR = 'ddd MMM DD [@] HH:mm YY';
const DAY_TIME = 'ddd [@] HH:mm';
const HOUR_MINS = 'HH:mm';

export function shiftFormat([shiftDate], hash) {
  let datetime;
  const fromDate = hash.fromDate;

  if (!shiftDate) {
    return '';
  }

  datetime = moment(shiftDate);
  if (!datetime.isValid()) {
    return shiftDate;
  }

  if (!fromDate) {
    return datetime.format(hash.year ? MONTH_DAY_TIME_YEAR : MONTH_DAY_TIME);
  }

  const fromDt = moment(fromDate);
  if (!fromDt.isValid()) {
    return datetime.format(MONTH_DAY_TIME);

  }
  if (datetime.day() !== fromDt.day()) {
    return datetime.format(DAY_TIME);
  }

  return datetime.format(HOUR_MINS);
}

export default helper(shiftFormat);
