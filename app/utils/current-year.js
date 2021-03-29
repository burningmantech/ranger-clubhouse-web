import { config } from 'clubhouse/utils/config';
import moment from 'moment';
/*
 * Get the current year unless the application is being 'Groundhog Day'ed.
 */

export default function currentYear() {
  const ghd = config('GroundhogDayTime');
  return +(ghd ? moment(ghd).year() :  (new Date()).getFullYear());
}
