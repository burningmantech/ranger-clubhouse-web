import { helper } from '@ember/component/helper';

export default helper(function hourMinuteWords(duration) {
  if (!duration) {
    duration = 0;
  }

  const minutes = Math.floor((duration / 60) % 60);
  const hours =  Math.floor(duration / 3600);

  let time = `${minutes} min${minutes === 1 ? '' : 's'}`;

  if (hours) {
    time = `${hours} hour${hours ===1 ? '' : 's'} ${time}`;
  }

  return time;
});
