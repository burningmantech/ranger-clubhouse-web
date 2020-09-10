import {helper} from '@ember/component/helper';

export default helper(function yearRange([years]) {
  const ranges = [];

  let currentYear = 0, startYear = 0;

  if (years.length === 0) {
    return 'none';
  }

  years.forEach((year) => {
    if (startYear === 0) {
      startYear = year;
      currentYear = year;
      return;
    }

    if (currentYear + 1 === year) {
      currentYear = year;
      return;
    }

    if (startYear == currentYear) {
      ranges.push(startYear);
    } else {
      ranges.push(`${startYear} - ${currentYear}`);
    }
    startYear = currentYear = year;
  });

  if (startYear === currentYear) {
    ranges.push(startYear);
  } else {
    ranges.push(`${startYear} - ${currentYear}`);
  }
  return ranges.join(', ');
});
