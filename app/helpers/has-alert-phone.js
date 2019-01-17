import { helper } from '@ember/component/helper';
import { isEmpty } from '@ember/utils';

export function hasAlertPhone([ alert, numbers]) {
  const phone = alert.on_playa ? numbers.on_playa.phone : numbers.off_playa.phone;

  return !isEmpty(phone);
}

export default helper(hasAlertPhone);
