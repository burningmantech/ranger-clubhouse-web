import {helper} from '@ember/component/helper';
import dayjs from 'dayjs';
import {isEmpty} from '@ember/utils';

export default helper(function dayjsFormat([date, format]/*, named*/) {
  return (isEmpty(date) ? dayjs() : dayjs(date)).format(format);
});
