import { helper } from '@ember/component/helper';
import moment from 'moment';

export function mdyFormat([ date ], params) {
  return moment(date).format(params.full ? 'dddd, MMMM Do YYYY' : 'MMM DD, YYYY');
}

export default helper(mdyFormat);
