import currentYear from 'clubhouse/utils/current-year';

export default function requestYear(params) {

  if (params.year) {
    const year = parseInt(params.year);

    if (!isNaN(year)) {
      return year;
    }
  }

  return currentYear();
}
