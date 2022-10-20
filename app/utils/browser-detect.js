/**
 * Credit goes to:
 * https://medium.com/@andreas.remdt/detecting-outdated-browsers-in-vanilla-javascript-1f214dc24e4d
 *
 * BrowserDetector
 *
 * This util checks the current browser name and version and offers a
 * convenient API to test for specific versions or browsers and whether
 * the current visitor uses a supported browser or not.
 */

export default class BrowserDetector {
  constructor() {
    this.browser = {};
    // Ensure this is in sync with config/targets.js
    this.unsupportedBrowsers = {
      Chrome: 82,
      Firefox: 76,
      Edge: 18,
      Opera: 50,
      Safari: 11
    };

    this._detectBrowser();
  }

  /**
   * Detects the current browser and its version number.
   *
   * @returns {Object} An object with keys for browser `name` and `version`.
   */
  _detectBrowser() {
    this.browser = (function() {
      let ua = navigator.userAgent,
        tem,
        M =
          ua.match(
            /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
          ) || [];

      if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return { name: "IE", version: tem[1] || "" };
      }


      if (M[1] === "Chrome") {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) {
          return { name: tem[1].replace("OPR", "Opera"), version: tem[2] };
        }
      }

      M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];

      if ((tem = ua.match(/version\/(\d+)/i)) != null) {
        M.splice(1, 1, tem[1]);
      }

      return { name: M[0], version: M[1] };
    })();
  }

  /**
   * Checks if the current browser is Internet Explorer.
   *
   * @returns {Boolean}
   */
  get isIE() {
    return this.browser.name === 'IE';
  }

  /**
   * Checks if the current browser is Edge.
   *
   * @returns {Boolean}
   */
  get isEdge() {
    return this.browser.name === 'Edge';
  }

  /**
   * Checks if the current browser is from Microsoft (Edge
   * or Internet Explorer).
   *
   * @returns {Boolean}
   */
  get isMicrosoft() {
    return this.isIE || this.isEdge;
  }

  /**
   * Checks if the current browser is Firefox.
   *
   * @returns {Boolean}
   */
  get isFirefox() {
    return this.browser.name === 'Firefox';
  }

  /**
   * Checks if the current browser is Chrome.
   *
   * @returns {Boolean}
   */
  get isChrome() {
    return this.browser.name === 'Chrome';
  }

  /**
   * Checks if the current browser is Safari.
   *
   * @returns {Boolean}
   */
  get isSafari() {
    return this.browser.name === 'Safari';
  }

  /**
   * Checks if the current browser is from an Android device.
   *
   * @returns {Boolean}
   */
  get isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  /**
   * Checks if the current browser is from a BlackBerry device.
   *
   * @returns {Boolean}
   */
  get isBlackBerry() {
    return /BlackBerry/i.test(navigator.userAgent);
  }

  /**
   * Checks if the current browser is from a Windows Mobile device.
   *
   * @returns {Boolean}
   */
  get isWindowsMobile() {
    return /IEMobile/i.test(navigator.userAgent);
  }

  /**
   * Checks if the current browser is Mobile Safari.
   *
   * @returns {Boolean}
   */
  get isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  /**
   * Checks if the current browser is a mobile browser.
   *
   * @returns {Boolean}
   */
  get isMobile() {
    return (
      this.isAndroid || this.isBlackBerry || this.isWindowsMobile || this.isIOS
    );
  }

  /**
   * Checks if the current browser is supported by
   * our environment.
   *
   * @returns {Boolean}
   */

  isSupported() {
    // eslint-disable-next-line no-prototype-builtins
    if (this.unsupportedBrowsers.hasOwnProperty(this.browser.name)) {
      if (+this.browser.version > this.unsupportedBrowsers[this.browser.name]) {
        return true;
      }
    }

    return false;
  }
}
