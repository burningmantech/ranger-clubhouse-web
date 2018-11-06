import { helper } from '@ember/component/helper';

export function alertPhone([ alert, person]) {
  const phone = alert.on_playa ? person.sms_on_playa : person.sms_off_playa;

  if (phone == '') {
    return 'no # number';
  } else {
    return phone;
  }
}

export default helper(alertPhone);
