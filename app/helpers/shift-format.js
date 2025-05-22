import {helper} from '@ember/component/helper';
import dayjs from 'dayjs';
import {htmlSafe} from '@ember/template';

export const MONTH_DAY_TIME = 'ddd MMM DD [@] HH:mm';
export const MONTH_DAY_TIME_YEAR = 'ddd MMM DD [@] HH:mm YYYY';
export const HOUR_MINS = 'HH:mm';
export const HOUR_MIN_DAY = 'ddd [@] HH:mm'

const guessedTz = dayjs.tz.guess();

export function shiftFormat([shiftDate, endDate], hash) {
  let datetime;
  let {tz, tzabbr} = hash;

  if (!shiftDate) {
    return '';
  }

  if (!tz) {
    tz = 'America/Los_Angeles';
    tzabbr = '';
  } else if (tzabbr === 'PDT' || tzabbr === 'PST') {
    tzabbr = '';
  } else {
    tzabbr = ` (${tzabbr})`;
  }

  datetime = dayjs(shiftDate);
  if (!datetime.isValid()) {
    return shiftDate;
  }

  const startLocal = dayjs.tz(shiftDate, tz).tz(guessedTz).format(MONTH_DAY_TIME_YEAR + ' (z)');
  if (!endDate) {
    return htmlSafe(`<span title="${startLocal}">${datetime.format(hash.year ? MONTH_DAY_TIME_YEAR : MONTH_DAY_TIME)}${tzabbr}</span>`);
  }

  const endDatetime = dayjs(endDate);
  if (!endDatetime.isValid()) {
    return htmlSafe(`<span title="${startLocal}">${datetime.format(MONTH_DAY_TIME)}${tzabbr}</span> to ${endDate}`);

  }

  const endLocal = dayjs.tz(endDate, tz).tz(guessedTz).format(MONTH_DAY_TIME_YEAR + ' (z)');
  if (hash.year) {
    return htmlSafe(`<span title="${startLocal}">${datetime.format(MONTH_DAY_TIME_YEAR)}${tzabbr}</span> to <span title="${endLocal}">${endDatetime.format(MONTH_DAY_TIME_YEAR)}</span>`);
  }

  const startDay = datetime.date(), endDay = endDatetime.date();

  let endFormat = null;

  if (datetime.year() !== endDatetime.year()) {
    return htmlSafe(`<span title="${startLocal}>${datetime.format(MONTH_DAY_TIME_YEAR)}${tzabbr}</span> to <span class="d-inline-block" title="${endLocal}">${endDatetime.format(MONTH_DAY_TIME_YEAR)}</span>`);
  } else if (startDay === endDay) {
    // Don't bother with added the day on the end time if its only to midnight
    endFormat = endDatetime.format(HOUR_MINS);
  } else if ((endDatetime.dayOfYear() - datetime.dayOfYear()) > 1) {
    endFormat = endDatetime.format(MONTH_DAY_TIME);
  } else {
    endFormat = endDatetime.format(HOUR_MIN_DAY);
  }
  return htmlSafe(`<span title="${startLocal}">${datetime.format(MONTH_DAY_TIME)}${tzabbr}</span> to <span class="d-inline-block" title="${endLocal}">${endFormat}</span>`);
}

export default helper(shiftFormat);
