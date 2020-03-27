/**
 * Get the event year - September or later refers to the upcoming year's event.
 */

export default function eventYear() {
  const date = new Date();
  const year = date.getFullYear();

  // Sigh getMonth is 0 to 11 unlike any other language framework.
  return date.getMonth() >= 8 ? year + 1 : year;
}
