import { helper } from '@ember/component/helper';

export function hourFormat( [ duration ]) {
  if (!duration) {
    return "0.0";
  }
  return (duration / 3600.0).toFixed(1);
}

export default helper(hourFormat);
