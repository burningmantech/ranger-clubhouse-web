import { helper } from '@ember/component/helper';
import currentYear from 'clubhouse/utils/current-year';

export function isCurrentYear([ year ]/*, hash*/) {
  return currentYear() == year;
}

export default helper(isCurrentYear);
