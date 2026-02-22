import {helper} from '@ember/component/helper';
import dayjs from 'dayjs';

export function applicationStalenessClass([date]) {
  if (!date) {
    return 'staleness-stale';
  }

  const days = dayjs().diff(dayjs(date), 'day');

  if (days <= 3) {
    return 'staleness-fresh';
  } else if (days <= 7) {
    return 'staleness-aging';
  } else {
    return 'staleness-stale';
  }
}

export default helper(applicationStalenessClass);
