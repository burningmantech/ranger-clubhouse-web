import ENV from 'clubhouse/config/environment';

/*
 * Get the current year unless the application is being 'groundhog'ed.
 */

export default function currentYear() {
  return ENV.groundHogYear || (new Date()).getFullYear();
}
