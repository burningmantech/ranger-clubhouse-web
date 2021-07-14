import { helper } from '@ember/component/helper';
import dayjs from 'dayjs';

export function timeFormat([ date ]/*, hash*/) {
  return dayjs(date).format('HH:mm');
}

export default helper(timeFormat);
