import { helper } from '@ember/component/helper';

export function creditsFormat([ credits ]) {
  if (credits == null) {
    credits = 0.0;
  }
  return (+credits).toFixed(2)
}

export default helper(creditsFormat);
