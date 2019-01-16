import Controller from '@ember/controller';
import $ from 'jquery';

/*
const F1 = 112;
const F2 = 113;
const F3 = 114;
*/

const ESC = 27;

export default class ApplicationController extends Controller {
  constructor() {
    super(...arguments);
    /*
     * Bind the keyup event on the body element to intercept the user's
     * typing so ESC to as shortcuts to the search page.
     */

    $('body').bind('keyup', (event) => {
      const dialogs = this.modal.dialogs;

      if (event.keyCode != ESC || dialogs.length > 0) {
        return true;
      }


      event.preventDefault(); // eslint-disable-line ember/jquery-ember-run

      this.transitionToRoute('/search/person'); // eslint-disable-line ember/jquery-ember-run
      return false;
    });
  }
}
