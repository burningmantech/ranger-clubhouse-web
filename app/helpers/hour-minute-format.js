import {helper} from '@ember/component/helper';
import {htmlSafe} from '@ember/template';

export function hourMinuteFormat([duration]) {
  if (!duration) {
    duration = 0;
  }

  const minutes = Math.floor((duration / 60) % 60);
  const hours = Math.floor(duration / 3600);

  const label = minutes < 10 ? `${hours}:0${minutes}` : `${hours}:${minutes}`;
  const minLabel = (minutes === 1) ? `1 minute` : `${minutes} minutes`;
  const datetime = hours ? `${hours} hours ${minLabel}` :minLabel;
  return htmlSafe(`<span aria-hidden="true">${label}</span><span class="sr-only">${datetime}</span>`);
}

export default helper(hourMinuteFormat);
