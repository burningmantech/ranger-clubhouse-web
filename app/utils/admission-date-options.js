import moment from 'moment';

export default function admissionDateOptions(year, wapDateRange) {
  const options = [
    [ 'Unspecified', '']
  ];

  let low = 5, high = 26;
  if (wapDateRange != null) {
    [low, high] = wapDateRange.split('-');
  }

  for (let day = high; day >= low; day--) {
    const date = `${year}-08-${day < 10 ? '0'+day : day}`;
    options.push([moment(date).format('ddd, MM/DD/YY'), date]);
  }

  options.push(['Any', 'any']);
  return options;
}
