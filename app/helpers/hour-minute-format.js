import { helper } from '@ember/component/helper';

export function hourMinuteFormat([ duration ]) {
  if (!duration) {
    duration = 0;
  }

  const minutes = Math.floor((duration / 60) % 60);
  const hours =  Math.floor(duration / 3600);

  if (minutes < 10) {
    return `${hours}:0${minutes}`;
  } else {
    return `${hours}:${minutes}`;
  }
}

export default helper(hourMinuteFormat);
