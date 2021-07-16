import AdvancedFormat from 'dayjs/plugin/advancedFormat';
import objectSupport from 'dayjs/plugin/objectSupport';
import dayjs from 'dayjs';

export function initialize(/* application */) {
  dayjs.extend(AdvancedFormat);
  dayjs.extend(objectSupport);
}

export default {
  initialize
};
