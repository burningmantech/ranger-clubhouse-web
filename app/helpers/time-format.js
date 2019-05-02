import { helper } from '@ember/component/helper';
import moment from 'moment';

export function timeFormat([ date ]/*, hash*/) {
  return moment(date).format('HH:mm');
}

export default helper(timeFormat);
