import Controller from '@ember/controller';

import $ from 'jquery';

const F1 = 112;
const F2 = 113;
const F3 = 114;

export default class ApplicationController extends Controller {
  constructor() {
    super(...arguments);
    /*
     * Bind the keyup event on the body element to intercept the user's
     * typing so F1/F2/etc can be use to as shortcuts to the search pages.
     */

    $('body').bind('keyup', (event) => {
      let bubbleUp = true;

      if (event.keyCode >= F1 && event.keyCode <= F3) {
        event.preventDefault();
        bubbleUp = false;
      }
      switch (event.keyCode) {
      case F1:
        this.transitionToRoute('/search/person');
        break;

      case F2:
        this.transitionToRoute('/search/assets');
        break;

      case F3:
        this.transitionToRoute('/search/languages');
        break;
      }

      return bubbleUp;
    });
  }
}
