import {setting} from 'clubhouse/utils/setting';
import dayjs from 'dayjs';
/*
 * Get the current year unless the application is being 'Groundhog Day'ed.
 */

export default function currentYear() {
  const ghd = setting('GroundhogDayTime');
  return +(ghd ? dayjs(ghd).year() :  (new Date()).getFullYear());
}
