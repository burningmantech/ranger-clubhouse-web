import { helper } from '@ember/component/helper';

export function isCurrentYear([ year ]/*, hash*/) {
  return (new Date).getFullYear() == year;
}

export default helper(isCurrentYear);
