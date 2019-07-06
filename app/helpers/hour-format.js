import { helper } from '@ember/component/helper';

export function hourFormat( [ duration ]) {
  if (!duration) {
    return "0.00";
  }
  return (+duration / 3600.0).toFixed(2);
}

export default helper(hourFormat);
