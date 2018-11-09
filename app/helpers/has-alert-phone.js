import { helper } from '@ember/component/helper';

export function hasAlertPhone([ alert, numbers]) {
  const phone = alert.on_playa ? numbers.on_playa.phone : numbers.off_playa.phone;

  return phone != '' ? true : false;
}

export default helper(hasAlertPhone);
