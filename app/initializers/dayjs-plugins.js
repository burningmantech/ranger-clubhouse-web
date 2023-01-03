import AdvancedFormat from 'dayjs/plugin/advancedFormat';
import objectSupport from 'dayjs/plugin/objectSupport';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import dayjs from 'dayjs';

export function initialize(/* application */) {
  dayjs.extend(AdvancedFormat);
  dayjs.extend(objectSupport);
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(dayOfYear);
}

export default {
  initialize
};
