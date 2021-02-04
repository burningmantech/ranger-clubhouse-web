import Controller from '@ember/controller';
import {run} from '@ember/runloop';
import ENV from 'clubhouse/config/environment';
import {tracked} from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  @tracked groundHogDayTime = null;

  applicationVersion = ENV.APP.version;
  buildTimestamp = ENV.APP.buildTimestamp;

  constructor() {
    super(...arguments);

    /*
     * Bind the keyup event so when Shift+F1 is pressed, the search bar is focused.
     */
    document.querySelector('body').addEventListener('keyup', (event) => {
      if (!(event.shiftKey && event.key === 'F1')) {
        return true;
      }

      event.preventDefault(); // eslint-disable-line ember/jquery-ember-run

      run.schedule('afterRender', () => {
        document.querySelector('#search-bar-form .autocomplete-input').focus();
      });

      return false;
    });
  }
}
