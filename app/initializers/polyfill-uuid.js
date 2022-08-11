/*
ember-data uses window.crypto.randomUUID() to fill in the id for a newly created but not save record.

The catch? randomUUID will not be available when the app is loaded from a URL with an explicit IP.
(e.g. https://10.0.0.1/client/me versus https://ranger-clubhouse/client/me)

All browsers have this behavior for "security reasons".

 */
export function initialize() {
  if ('randomUUID' in window.crypto) {
    // Got it!
    return;
  }
  // https://stackoverflow.com/a/2117523/2800218
  // LICENSE: https://creativecommons.org/licenses/by-sa/4.0/legalcode
  window.crypto.randomUUID = function randomUUID() {
    return (
      [1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g,
      c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  };
}

export default {
  initialize
};

