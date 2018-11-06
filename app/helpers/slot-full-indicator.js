import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function slotFullIndicator([ signedUp, max ]/*, hash*/) {
  if (signedUp >= max) {
    return htmlSafe('<span class="text-danger">FULL</span>')
  }

  const width = Math.floor((signedUp*100)/max);
  const color = width >= 85 ? 'warning' : 'success';

  return htmlSafe(
    `<div class="progress position-relative" style="height: 1.75em;">
    <div class="progress-bar bg-${color}" role="progressbar" style="width: ${width}%"></div>
    <span class="justify-content-center d-flex position-absolute w-100">${signedUp}/${max}</span>
  </div>`);
}

export default helper(slotFullIndicator);
