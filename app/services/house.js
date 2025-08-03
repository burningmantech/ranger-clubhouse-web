import Service, {service} from '@ember/service';
import ENV from 'clubhouse/config/environment';
import {isAbortError} from 'clubhouse/utils/ajax/response-errors';
import {isArray} from '@ember/array';
import {run, later} from '@ember/runloop';
import {isEmpty} from '@ember/utils';
import currentYear from 'clubhouse/utils/current-year';
import {isChangeset} from 'validated-changeset';
import {AbortError, InvalidError, NotFoundError, ServerError, TimeoutError} from '@ember-data/adapter/error'
import dayjs from "dayjs";
import {htmlSafe} from '@ember/template';
import logError from "clubhouse/utils/log-error";
import isOffline from "clubhouse/utils/is-offline";

const JavascriptExceptions = [
  // AggregateError, -- not defined for Safari 12.
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
];

export default class HouseService extends Service {
  @service router;
  @service toast;
  @service session;
  @service store;
  @service modal;

  cachedScripts = {};

  /**
   * Handle a catch promise response (Ember Data save, ajax request, etc). If a Change Set object was
   * passed, and the response was a validation error (http status 422), then populate the object with
   * errors via pushErrors()
   *
   * @param {Object} response
   * @param {Changeset} [changeSet=null]
   */
  handleErrorResponse(response, changeSet = null) {
    let message, errorType;
    let responseErrors = null;

    if (ENV.showAjaxErrors) {
      // When debugging - dump all errors to the console.
      console.error(response);
    }

    if (isOffline(response)) {
      this.session.showOfflineDialog = true;
      return;
    }

    if (response.status === 401 && this.session.isAuthenticated) {
      // The session has expired.
      this.session.sessionExpiredNotification();
      return;
    }

    const haveChangeset = (changeSet && 'pushErrors' in changeSet);

    // Did the request timeout?
    if (response.name === 'AbortError'
      || response.message?.match(/Timeout error/i)
      || response instanceof TimeoutError
      || response instanceof AbortError
      || isAbortError(response)
    ) {
      responseErrors = 'The operation timed out.';
      errorType = 'serve';
    } else if (response instanceof InvalidError) {
      // Ember Data request error
      responseErrors = response.errors.map(({title, detail}) => (detail ?? title));
      errorType = 'validation';
      if (haveChangeset && response.errors) {
        // Populate change set model with the validation errors
        response.errors.forEach(({title, detail, source}) => {
          const attr = source.pointer.replace('/data/attributes/', '');
          changeSet.pushErrors(attr, detail ?? title);
        });

        // After the form renders, scroll to the first marked invalid field
        this.scrollToElement('.is-invalid');
      }
    } else if (response instanceof ServerError) {
      if (response.errors) {
        responseErrors = response.errors.map(({title, detail}) => (detail ?? title));
      } else {
        responseErrors = 'The record operation was unsuccessful due to a fatal server error';
      }
      errorType = 'server';
    } else if (response instanceof NotFoundError) {
      responseErrors = 'The record was not found.';
    } else if (JavascriptExceptions.find((e) => response instanceof e)) {
      // Crap, a bug with the frontend.
      errorType = 'frontend';
      responseErrors = 'A bug was tripped over!';
      logError(response, 'client-error');
    } else if (response) {
      let status;

      const data = response.json ? response.json : response.payload;
      status = response.status;

      if (data) {
        if (data.errors) {
          responseErrors = data.errors.map(({title, detail}) => (detail ?? title));
        } else if (data.error) {
          responseErrors = data.error;
        }
      }

      switch (status) {
        case 400:
        case 404:
          errorType = 'record not found';
          break;

        case 401:
          errorType = 'authorization';
          break;

        case 403:
          errorType = 'not permitted';
          break;

        case 422:
          errorType = 'validation';
          if (haveChangeset && response.payload && response.payload.errors) {
            // Populate change set model with the validation errors
            response.payload.errors.forEach(({title, detail, source}) => {
              if (!source) {
                return;
              }
              const attr = source.pointer.replace('/data/attributes/', '');
              changeSet.pushErrors(attr, (detail ?? title));
            });

            // After the form renders, scroll to the first marked invalid field
            this.scrollToElement('.is-invalid');
          }
          break;

        default:
          if (!status || status >= 500) {
            errorType = `server error ${status}`;
          } else {
            errorType = `unknown (status ${status})`;
          }
          break;
      }
    } else {
      errorType = 'unknown';
    }


    if (responseErrors) {
      if (!isArray(responseErrors)) {
        responseErrors = [responseErrors];
      }

      const plural = responseErrors.length === 1 ?
        ' was' :
        's were';
      message = `The following ${errorType} error${plural} encountered:`;
      if (responseErrors.length === 1) {
        message += `<p>${responseErrors[0]}</p>`;
      } else {
        const errorList = responseErrors.map((error) => `<li>${error}</li>`);
        message += `<ul>${errorList.join('')}</ul>`;
      }
    } else {
      message = `A server error was encountered:<ul><li>${response}</li></ul>`;
    }

    this.modal.info('An error occurred', htmlSafe(message));
  }


  /**
   * Save an Ember Data record or Change Set object
   *
   * @param {*} model
   * @param {string} successMessage A toast message to show on success
   * @param {string|function} routeOrCallback Route to transition to or callback function
   * @param {function|null} finallyCallback
   * @returns {Promise<*>}
   */

  async saveModel(model, successMessage, routeOrCallback = null, finallyCallback = null) {
    this.toast.clear();

    const isCallback = typeof (routeOrCallback) === 'function';

    try {
      const result = await model.save();
      this.toast.success(successMessage);
      if (isCallback) {
        routeOrCallback(model, result);
      } else if (routeOrCallback) {
        this.router.transitionTo(routeOrCallback);
      }
    } catch (response) {
      if (isChangeset(model)) {
        this.handleErrorResponse(response, model);
      } else {
        this.handleErrorResponse(response);
      }
    } finally {
      finallyCallback?.();
    }
  }


  /**
   * Download an array as a CSV file.
   *
   * @param {string} filename
   * @param {Object[]} columns column list
   * @param {string} columns.title the title for each column
   * @param {string} columns.key the key into each data row
   * @param {Object[]} data
   */

  downloadCsv(filename, columns, data) {
    const headers = columns.map((column) => {
      let header = typeof column === 'string' ? column : column.title;
      header = header.replace(/"/g, '""');
      if (header.search(/("|,|\n)/g) >= 0) {
        header = `"${header}"`;
      }

      return header;
    });

    let contents = headers.join(',') + "\n";

    data.forEach((line) => {
      let fields = [];
      columns.forEach((column) => {
        let value, yesno = false, format;
        if (typeof column == 'string') {
          value = line[column];
        } else {
          if ('value' in column) {
            value = column.value;
          } else if (column.blank) {
            value = '';
          } else {
            value = line[column.key];
          }

          if (column.yesno) {
            yesno = true;
          } else if (column.format) {
            format = column.format;
          }
        }

        if (yesno) {
          value = value ? 'Y' : 'N';
        } else if (format) {
          switch (format) {
            case 'date':
              if (value) {
                value = dayjs(value).format('YYYY-MM-DD');
              } else {
                value = '';
              }
              break;
          }
        } else {
          value = isEmpty(value) ? '' : value.toString();
        }

        value = value.replace(/"/g, '""');
        if (value.search(/("|,|\n)/g) >= 0) {
          value = `"${value}"`;
        }
        fields.push(value);
      });
      contents += fields.join(',') + "\n";
    });

    this.downloadFile(filename, contents, 'text/csv');

    return contents;
  }

  /**
   * Download a file
   *
   * @param {string} filename download as name
   * @param {string} contents
   * @param {string} type MIME type (e.g., text/csv, text/html, etc.)
   */

  downloadFile(filename, contents, type) {
    run('afterRender', () => {
      const {document, URL} = window;
      const anchor = document.createElement('a');

      anchor.download = filename;
      anchor.href = URL.createObjectURL(new Blob([contents], {type}));
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    })
  }

  /**
   * Download a URL
   *
   * @param {string} url
   */

  downloadUrl(url) {
    run('afterRender', () => {
      const {document} = window;
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = url.split('/').pop();
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    });
  }

  /**
   * Scroll to top
   */

  scrollToTop(instance = false) {
    run('afterRender', () => window.scrollTo({top: 0, left: 0, behavior: instance ? 'instant' : 'smooth'}));
  }

  /**
   * Scroll to element
   *
   * @param {string} selector Element ID to scroll to
   * @param instance
   */

  scrollToElement(selector, instance = false) {
    later(() => {
      const behavior = instance ? 'instant' : 'smooth';
      const element = (selector instanceof Element) ? selector : document.querySelector(selector);
      if (!element) {
        return;
      }

      const {top, bottom} = element.getBoundingClientRect();
      const isModal = element.closest('.modal');
       if (isModal || bottom > window.innerHeight || top < 0) {
        element.scrollIntoView({behavior});
      } else {
        // Element is already in view, scroll element mostly to the top.
        window.scroll({top: top + window.scrollY - 100, behavior});
      }
    }, 100);
  }

  /**
   * Scroll to an accordion and, if closed, open it
   * @param {string} id
   */

  scrollToAccordion(id) {
    if (this.openAccordion(id)) {
      // Accordion was opened, delay the scroll in case the accordion body needs to be rendered.
      setTimeout(() => {
        this.scrollToElement(`#${id}`);
      }, 350);
    } else {
      // Accordion already opened, scroll immediately.
      this.scrollToElement(`#${id}`);
    }
  }

  /**
   * Open an accordion. Return true if the accordion was previously closed.
   *
   * @param id
   * @returns {boolean}
   */
  openAccordion(id) {
    return this.toggleAccordion(id, true);
  }

  /**
   * Close up an accordion. Return true if the accordion was previously opened.
   *
   * @param id
   * @returns {boolean}
   */

  closeAccordion(id) {
    return this.toggleAccordion(id, false);
  }

  /**
   * Toggle an accordion.
   * @param id
   * @param {boolean} open
   * @returns {boolean}
   */
  toggleAccordion(id, open) {
    const accordion = document.querySelector(`#${id} .accordion-body`);
    if (open !== !!accordion?.classList.contains('show')) {
      document.querySelector(`#${id} .accordion-title`)?.click();
      return true;
    }

    return false;

  }

  /**
   * Obtain the current year
   *
   */

  currentYear() {
    return currentYear();
  }

  _getStorage() {
    let storage;

    try {
      storage = window.localStorage.getItem('clubhouse');

      if (storage) {
        storage = JSON.parse(storage);
      }
    } catch (e) {
      // browser blocking localStorage or not available.
      return {};
    }

    return storage || {};
  }

  /*
   * local storage management
   */
  setKey(key, data) {
    const storage = this._getStorage();

    if (data == null) {
      delete storage[key];
    } else {
      storage[key] = data;
    }

    try {
      window.localStorage.setItem('clubhouse', JSON.stringify(storage));
    } catch (e) {
      // browser blocking localStorage or not available.
    }
  }

  getKey(key) {
    return this._getStorage()[key];
  }

  clearStorage() {
    try {
      window.localStorage.removeItem('clubhouse');
    } catch (e) {
      // browser blocking localStorage or not available.
    }
  }

  /*
   * Avoids common pitfalls and the weird undocumented special-sauce format that must be used with the built-in pushPayload
   *
   */

  pushPayload(modelName, rawPayload) {
    if (isArray(rawPayload)) {
      return rawPayload.map((payload) => this.store.push(this.store.normalize(modelName, payload)));
    } else {
      return this.store.push(this.store.normalize(modelName, rawPayload));
    }
  }

  /**
   * Load an external script, and cache it
   */

  loadScript(url) {
    if (this.cachedScripts[url]) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      document.head.append(script);
      script.onload = () => {
        this.cachedScripts[url] = true;
        resolve();
      };
      script.onerror = () => reject();
      script.src = url; // Boom!
    });
  }

  /**
   * Record an action
   *
   * @param {string} event
   * @param {Object|null} data
   * @param {string|null} message
   */

  actionRecord(event, data = null, message = null) {
    if (!('sendBeacon' in navigator)) {
      // Too old of browser, or api is blocked by a "security" browser extension.
      return;
    }

    const record = new FormData;

    record.append('event', event);
    if (data) {
      record.append('data', JSON.stringify(data));
    }

    if (message) {
      record.append('message', message);
    }

    if (this.session.isAuthenticated) {
      const person_id = +this.session.userId;

      if (person_id) {
        record.append('person_id', person_id);
      }

      const route = this.router.currentRouteName;

      if (route.startsWith('person.') || route.startsWith('hq.')) {
        const targetId = +this.router.currentRoute.parent?.params?.person_id;
        if (!isNaN(targetId)) {
          record.append('target_person_id', targetId);
        }
      }
      record.append('person_id', this.session.userId);
    }

    navigator.sendBeacon(ENV['api-server'] + '/action-log/record', record);
  }

  async copyToClipboard(thing) {
    const success = 'Copied to the clipboard.';

    const text = typeof thing === 'string' ? thing : thing.textContent;

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        this.toast.success(success);
      } catch (err) {
        this.toast.error(`Sorry, unable to copy the text to the clipboard. Error: [${err}]`);
      }
      return;
    } else if (window.clipboardData) {
      window.clipboardData.setData('Text', text);
      this.toast.success(success);
      return;
    }


    // Create a Range object used to select the element's text.
    const range = document.createRange();
    const selection = window.getSelection();

    // Select the text into the range
    range.selectNodeContents(thing);
    // Remove previously selected range
    selection.removeAllRanges();
    // And now set the new range
    selection.addRange(range);

    try {
      // Copy the selection to the clipboard
      document.execCommand("copy");
    } catch (err) {
      this.toast.error(`Sorry, unable to copy the text to the clipboard. Error: [${err}]`);
      return;
    }

    selection.removeAllRanges();
    this.toast.success(success);
  }

}
