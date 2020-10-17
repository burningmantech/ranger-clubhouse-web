import Controller from '@ember/controller';
import {run} from '@ember/runloop';
import {config} from 'clubhouse/utils/config';
import moment from 'moment';
import ENV from 'clubhouse/config/environment';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  @tracked groundHogDayTime = null;

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

    /*
     * Polyfill canvas.toBlob for IE Edge
     */

    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
          const dataURL = this.toDataURL(type, quality).split(',')[1];
          setTimeout(function () {

            let binStr = atob(dataURL),
              len = binStr.length,
              arr = new Uint8Array(len);

            for (let i = 0; i < len; i++) {
              arr[i] = binStr.charCodeAt(i);
            }

            callback(new Blob([arr], {type: type || 'image/png'}));

          });
        }
      });
    }
  }

  setup() {
    /*
     * Is the server in an groundhog day configuration where science and demonology blend
     * seamlessly together and the entire 1970s decade loops infinitely ... err wait, that's Scarfolk.
     * If the the server reported a Ground Hog Day time, show the time in the banner.
     */

    const ghd = config('GroundhogDayTime');
    if (ghd) {
      this.groundHogDayTime = moment(ghd);
    }

  }

  get applicationVersion() {
    return ENV.APP.version;
  }

  get buildTimestamp() {
    return ENV.APP.buildTimestamp;
  }
}
