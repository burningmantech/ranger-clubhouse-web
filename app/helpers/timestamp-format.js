import { helper } from '@ember/component/helper';
import dayjs from 'dayjs';

/**
 * Many timestamps in the database are stored as UTC-7 absolute, not UTC nor Pacific.
 *
 * Take the timestamp and reformat it to Pacific.
 */

export default helper(function timestampFormat([time, format] /*, named*/) {
  return dayjs(`${time}-0700`).tz('America/Los_Angeles').format(format ?? 'YYYY-MM-DD HH:mm:ss');
});
