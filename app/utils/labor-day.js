import dayjs from 'dayjs';

export default function laborDay(year) {
  for (let i = 1; i <= 7; i++) {
    const day = dayjs({ year, month: 8, day: i});
    if (day.day() === 1) { // first Monday of September
      return day;
    }
  }
  throw new Error(`{year} doesn't have a first Monday?!`);
}
