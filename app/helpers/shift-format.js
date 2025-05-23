import {helper} from '@ember/component/helper';
import dayjs from 'dayjs';
import {htmlSafe} from '@ember/template';

export const MONTH_DAY_TIME = 'ddd MMM DD [@] HH:mm';
export const MONTH_DAY_TIME_YEAR = 'ddd MMM DD [@] HH:mm YYYY';
export const HOUR_MINS = 'HH:mm';
export const HOUR_MIN_DAY = 'ddd [@] HH:mm'

const guessedTz = dayjs.tz.guess();

function formatDate(date, format, abbr='') {
  const localTime = date.tz(guessedTz).format(MONTH_DAY_TIME_YEAR + ' (z)');
  return `<span title="${localTime}">${date.format(format)}${abbr}</span>`;
}

export function shiftFormat([start, end], hash) {
  const {tz, tzabbr} = hash;
  let timezone, displayAbbr;

  if (!start) {
    return '';
  }

  if (!tz) {
    timezone = 'America/Los_Angeles';
    displayAbbr = '';
  } else {
    timezone = tz;
    displayAbbr = ` (${tzabbr})`;
  }

  let startParsed = dayjs(start);
  if (!startParsed.isValid()) {
    return start;
  }

  startParsed = startParsed.tz(timezone, true);
  if (!end) {
    return htmlSafe(formatDate(startParsed, hash.year ? MONTH_DAY_TIME_YEAR : MONTH_DAY_TIME, displayAbbr));
  }

  let endParsed = dayjs(end);
  if (!endParsed.isValid()) {
    return htmlSafe(`${formatDate(hash.year ? MONTH_DAY_TIME_YEAR : MONTH_DAY_TIME, displayAbbr)} to ${end}`);
  }

  endParsed = endParsed.tz(timezone, true);
  if (hash.year) {
    return htmlSafe(`${formatDate(startParsed, MONTH_DAY_TIME_YEAR, displayAbbr)} to ${formatDate(endParsed, MONTH_DAY_TIME_YEAR, displayAbbr)}`);
  }

  const startDay = startParsed.date(), endDay = endParsed.date();

  if (startParsed.year() !== endParsed.year()) {
    return htmlSafe(`${formatDate(startParsed, MONTH_DAY_TIME_YEAR, displayAbbr)} to ${formatDate(endParsed, MONTH_DAY_TIME_YEAR, displayAbbr)}`);
  }

  let endFormat;
  if (startDay === endDay) {
    // Don't bother with added the day on the end time if its only to midnight
    endFormat = HOUR_MINS;
  } else if ((endParsed.dayOfYear() - startParsed.dayOfYear()) > 1) {
    endFormat = MONTH_DAY_TIME;
  } else {
    endFormat = HOUR_MIN_DAY;
  }
  return htmlSafe(`${formatDate(startParsed, MONTH_DAY_TIME, displayAbbr)} to ${formatDate(endParsed, endFormat)}`);
}

export default helper(shiftFormat);
