import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function slotFullIndicator([ signedUp, max ]/*, hash*/) {

  let color, width, text;

  text = `${signedUp}/${max}`;

  if (signedUp >= max) {
    color = 'light-red';
    width = 100;
    text = 'FULL '+text;
  } else {
    color = width >= 85 ? 'warning' : 'success';
    width = Math.floor((signedUp*100)/max);
  }

  return htmlSafe(
    `<div class="progress position-relative" style="height: 1.75em;">
    <div class="progress-bar bg-${color}" role="progressbar" style="width: ${width}%"></div>
    <span class="justify-content-center d-flex position-absolute w-100">${text}</span>
  </div>`);
}

export default helper(slotFullIndicator);
