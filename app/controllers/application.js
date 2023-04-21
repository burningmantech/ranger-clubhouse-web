import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {schedule} from '@ember/runloop';
import ENV from 'clubhouse/config/environment';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class ApplicationController extends ClubhouseController {
  @tracked groundHogDayTime = null;
  @tracked showBrowserNotSupported = false;
  @tracked showSearchBar;

  applicationVersion = ENV.APP.version;
  buildTimestamp = ENV.APP.buildTimestamp;

  constructor() {
    super(...arguments);

    /*
     * Bind the keyup event so when Shift+F1 (all platforms), <CMD>-K (Mac OS) or <CTRL>-K (Linux/Windows) is pressed,
     * the search bar is focused.
     */

    const isMac = navigator.userAgent.indexOf("Mac") !== -1;

    document.querySelector('body').addEventListener('keydown', (event) => {
      if (!this.session.user || !this.session.hasLoginManagement) {
        // Not logged in or does not have LMOP
        return true;
      }

      const {key} = event;
      if ((event.shiftKey && key === 'F1')
        // Mac OS X <CMD>-K
        || (isMac && event.metaKey && key === 'k')
        // Linux/Window <CTRL>-K
        || (!isMac && event.ctrlKey && key === 'k')
      ) {
        event.preventDefault(); // eslint-disable-line ember/jquery-ember-run
        schedule('afterRender', () => this.session.showSearchDialog = true);
        return false;
      } else {
        return true;
      }
    });

    this.showBrowserNotSupported = !this.session.browserDetect.isSupported();
  }

  @action
  closeBrowserNotSupported() {
    this.showBrowserNotSupported = false;
  }

  @action
  closeOfflineDialog() {
    this.session.showOfflineDialog = false;
  }
}
