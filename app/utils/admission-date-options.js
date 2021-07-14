import dayjs from 'dayjs';

const DATE_FORMAT = 'ddd, MM/DD/YY';

export default function admissionDateOptions(year, wapDateRange, originalDate = null) {
  const options = [
    ['Unspecified', '']
  ];

  if (originalDate) {
    const origMoment = dayjs(originalDate);
    if (origMoment.year() != year) {
      options.push([origMoment.format(DATE_FORMAT), originalDate]);
    }
  }

  let low = 5, high = 26;
  if (wapDateRange != null) {
    [low, high] = wapDateRange.replace(/\s/, '').split('-');
    low = parseInt(low);
    high = parseInt(high);

    if (!low) {
      low = 5;
    }

    if (!high) {
      high = 26;
    }
  }


  for (let day = high; day >= low; day--) {
    const date = `${year}-08-${day < 10 ? '0' + day : day}`;
    options.push([dayjs(date).format(DATE_FORMAT), date]);
  }

  options.push(['Any', 'any']);
  return options;
}
