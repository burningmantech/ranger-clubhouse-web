import { helper } from '@ember/component/helper';
import dayjs from 'dayjs';

export function mdyFormat([ date ], params) {
  return dayjs(date).format(params.full ? 'dddd, MMMM Do YYYY' : 'MMM DD, YYYY');
}

export default helper(mdyFormat);
