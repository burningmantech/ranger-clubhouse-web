import { helper } from '@ember/component/helper';
import moment from 'moment';

export function mdyFormat([ date ]/*, hash*/) {
  return moment(date).format('MMM DD, YYYY');
}

export default helper(mdyFormat);
