import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {schedule} from '@ember/runloop';
import ENV from 'clubhouse/config/environment';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

const BROWSER_CHECK_SKIP = 'browser-check-skip';

export default class ApplicationController extends ClubhouseController {
  @tracked groundHogDayTime = null;
  @tracked showBrowserNotSupported = false;
  @tracked skipBrowserCheck = false;
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
      if (!this.session.user || !this.session.hasEventManagement) {
        // Not logged in or does not have EMOP
        return true;
      }

      const {key} = event;
      if (
        // Mac OS X <CMD>-K
        (isMac && event.metaKey && key === 'k')
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

    this.showBrowserNotSupported = !this.session.browserDetect.isSupported()
      && !this._browserCheckWasSkipped();
  }

  @action
  scrollToTopAction() {
    this.scroll.scrollToTop();
  }

  @action
  intersectionCallback(entries) {
    if (!this.scrollToTopButton) {
      return;
    }

    entries.forEach(entry => this.scrollToTopButton.style.display = entry.isIntersecting ? 'block' : 'none');
  }

  @action
  scrollToTopButtonInserted(element) {
    this.scrollToTopButton = element;
  }

  @action
  bodyRowInserted(element) {
    if (!('IntersectionObserver' in window)) {
      // Too old of browser.
      return;
    }
    this.bodyRowObserver = new IntersectionObserver(this.intersectionCallback,
      {
        root: null,
        rootMargin: '0px 0px -100%',
        threshold: 0,
      });
    this.bodyRowObserver.observe(element);
  }


  /**
   * Has the user already asked not to be warned about the browser they're running?
   *
   * The name & version are recorded rather than a bare flag so switching browsers,
   * or moving to a different (still unsupported) version, warns again.
   */

  _browserCheckWasSkipped() {
    const skipped = this.storage.getDeviceKey(BROWSER_CHECK_SKIP);

    if (!skipped) {
      return false;
    }

    const {name, version} = this.session.browserDetect.browser;

    return skipped.name === name && skipped.version === version;
  }

  @action
  closeBrowserNotSupported() {
    if (this.skipBrowserCheck) {
      const {name, version} = this.session.browserDetect.browser;
      this.storage.setDeviceKey(BROWSER_CHECK_SKIP, {name, version});
    }

    this.showBrowserNotSupported = false;
  }

  @action
  toggleSkipBrowserCheck(event) {
    this.skipBrowserCheck = event.target.checked;
  }

  @action
  closeOfflineDialog() {
    this.session.showOfflineDialog = false;
  }

  @action
  transitionToMessages() {
    const {currentRoute} = this.router;
    const {name} = currentRoute;

    this.session.showNewMessageDialog = false;

    if (name === 'me.messages'
      || ((name === 'hq.messages' || name === 'person.messages') && +currentRoute.params.person_id === this.session.userId)) {
      this.session.refreshMessages();
    } else {
      this.router.transitionTo('me.messages');
    }
  }

  @action
  closeNewMessageDialog() {
    this.session.showNewMessageDialog = false;
  }
}
