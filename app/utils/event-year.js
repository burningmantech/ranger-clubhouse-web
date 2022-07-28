import {config} from 'clubhouse/utils/config';

/**
 * Get the event year - September or later refers to the upcoming year's event.
 */

export default function eventYear() {
  const ghd = config('GroundhogDayTime');

  const date = ghd ? new Date(ghd) : new Date();
  const year = date.getFullYear();

  // Sigh getMonth is 0 to 11 unlike any other language framework.
  return date.getMonth() >= 8 ? year + 1 : year;
}
