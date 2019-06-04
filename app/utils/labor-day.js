import moment from 'moment';

export default function laborDay(year) {
  for (let i = 1; i <= 7; i++) {
    let day = moment([year, 8, i]);
    if (day.day() === 1) { // first Monday of September
      return day;
    }
  }
  throw new Error(`{year} doesn't have a first Monday?!`);
}
