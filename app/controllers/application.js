import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {schedule} from '@ember/runloop';
import ENV from 'clubhouse/config/environment';
import { action } from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class ApplicationController extends ClubhouseController {
  @tracked groundHogDayTime = null;
  @tracked showBrowserNotSupported = false;

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

      schedule('afterRender', () => {
        document.querySelector('#search-bar-form .autocomplete-input').focus();
      });

      return false;
    });

    this.showBrowserNotSupported = !this.session.browserDetect.isSupported();
  }

  @action
  closeBrowserNotSupported() {
    this.showBrowserNotSupported = false;
  }
}
