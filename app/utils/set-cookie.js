/*
 * Set a browser cookie
 */

export default function setCookie(name, value, seconds) {
  let expires = "";
  if (seconds) {
    var date = new Date();
    date.setTime(date.getTime() + (seconds * 1000));
    expires = "; expires=" + date.toUTCString();
  } else if (seconds == 0) {
    // Delete the cookie
    expires = '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
