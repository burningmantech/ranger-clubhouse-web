import {helper} from '@ember/component/helper';
import dayjs from 'dayjs';
import { htmlSafe } from '@ember/template';

const MONTH_DAY_TIME = 'ddd MMM DD [@] HH:mm';
const MONTH_DAY_TIME_YEAR = 'ddd MMM DD [@] HH:mm YYYY';
const HOUR_MINS = 'HH:mm';
const HOUR_MIN_DAY = 'ddd [@] HH:mm'

export function shiftFormat([shiftDate, endDate], hash) {
  let datetime;

  if (!shiftDate) {
    return '';
  }

  datetime = dayjs(shiftDate);
  if (!datetime.isValid()) {
    return shiftDate;
  }

  if (!endDate) {
    return datetime.format(hash.year ? MONTH_DAY_TIME_YEAR : MONTH_DAY_TIME);
  }

  const endDatetime = dayjs(endDate);
  if (!endDatetime.isValid()) {
    return datetime.format(MONTH_DAY_TIME);

  }

  if (hash.year) {
    return datetime.format(MONTH_DAY_TIME_YEAR) + ' to ' + endDatetime.format(MONTH_DAY_TIME_YEAR);
  }

  const startDay = datetime.date(), endDay = endDatetime.date();

  let endFormat = null;

  if (datetime.year() !== endDatetime.year()) {
    return htmlSafe(`${datetime.format(MONTH_DAY_TIME_YEAR)} to <span class="d-inline-block">${endDatetime.format(MONTH_DAY_TIME_YEAR)}</span>`);
  } else if (startDay === endDay) {
    // Don't bother with added the day on the end time if its only to midnight
    endFormat = endDatetime.format(HOUR_MINS);
  } else if ((endDatetime.dayOfYear() - datetime.dayOfYear()) > 1) {
    endFormat = endDatetime.format(MONTH_DAY_TIME);
  } else {
    endFormat = endDatetime.format(HOUR_MIN_DAY);
  }
  return htmlSafe(`${datetime.format(MONTH_DAY_TIME)} to <span class="d-inline-block">${endFormat}</span>`);
}

export default helper(shiftFormat);
