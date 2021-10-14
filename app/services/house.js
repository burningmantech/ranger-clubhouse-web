import Service, {inject as service} from '@ember/service';
import ENV from 'clubhouse/config/environment';
import {isAbortError, isTimeoutError} from 'ember-ajax/errors';
import {isArray} from '@ember/array';
import {run} from '@ember/runloop';
import {isEmpty} from '@ember/utils';
import currentYear from 'clubhouse/utils/current-year';
import {isChangeset} from 'validated-changeset';
import {AbortError, InvalidError, NotFoundError, ServerError, TimeoutError} from '@ember-data/adapter/error'
import bootstrap from 'bootstrap';

export default class HouseService extends Service {
  @service toast;
  @service session;
  @service store;

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

    if (+response.status === 401 && this.session.isAuthenticated) {
      this.toast.warning('Your session has timed out. Please login again.')
      this.session.invalidate();
      return;
    }

    const haveChangeset = (changeSet && 'pushErrors' in changeSet);

    // Ember Data request error
    if (response instanceof InvalidError) {
      responseErrors = response.errors.map((error) => error.title);
      errorType = 'validation';
      if (haveChangeset && response.errors) {
        // Populate change set model with the validation errors
        response.errors.forEach(({title, source}) => {
          const attr = source.pointer.replace('/data/attributes/', '');
          changeSet.pushErrors(attr, title);
        });

        // After the form renders, scroll to the first marked invalid field
        this.scrollToElement('.is-invalid');
      }
    } else if (response instanceof ServerError) {
      if (response.errors) {
        responseErrors = response.errors.map(({title}) => title);
      } else {
        responseErrors = 'The record operation was unsuccessful due to a fatal server error';
      }
      errorType = 'server';
    } else if (response instanceof TimeoutError ||
      response instanceof AbortError ||
      isAbortError(response) ||
      isTimeoutError(response) ||
      (response.name === 'NetworkError' || response.message?.match(/NetworkError/))
    ) {
      // Offline errors.
      responseErrors = 'The request to the Clubhouse server could not be completed. The server might be offline or the Internet connection is spotty.';
      errorType = 'server';
    } else if (response instanceof NotFoundError) {
      responseErrors = 'The record was not found.';
    } else if (response) {
      let status;

      const data = response.json ? response.json : response.payload;
      status = response.status;

      if (data) {
        if (data.errors) {
          responseErrors = data.errors.map((error) => error.title);
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
            response.payload.errors.forEach(({title, source}) => {
              const attr = source.pointer.replace('/data/attributes/', '');
              changeSet.pushErrors(attr, title);
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

    this.toast.error(message);
  }

  /**
   * Save an Ember Data record or Change Set object
   *
   * @param {*} model
   * @param {string} successMessage A toast message to show on success
   * @param {string|function} routeOrCallback Route to transition to or callback function
   * @returns {Promise<*>}
   */

  saveModel(model, successMessage, routeOrCallback = null) {
    this.toast.clear();

    const isCallback = typeof (routeOrCallback) === 'function';

    /*
    if (!model.get('isDirty') && !model.get('isNew')) {
      this.toast.success(successMessage);
      if (isCallback) {
        routeOrCallback(model);
      } else if (routeOrCallback){
        this.transitionToRoute(routeOrCallback);
      }
      return;
    }*/

    return model.save().then((result) => {
      this.toast.success(successMessage);
      if (isCallback) {
        routeOrCallback(model, result);
      } else if (routeOrCallback) {
        this.transitionToRoute(routeOrCallback);
      }
    }).catch((response) => {
      if (isChangeset(model)) {
        this.handleErrorResponse(response, model);
      } else {
        this.handleErrorResponse(response);
      }
    });
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
      if (typeof column === 'string') {
        return column;
      } else {
        return column.title;
      }
    });

    let contents = headers.join(',') + "\n";

    data.forEach((line) => {
      let fields = [];
      columns.forEach((column) => {
        let value, yesno = false;
        if (typeof column == 'string') {
          value = line[column];
        } else {
          value = line[column.key];
          if (column.yesno) {
            yesno = true;
          }
        }

        if (yesno) {
          value = value ? 'Y' : 'N';
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
      anchor.download = true;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    });
  }

  /**
   * Scroll to top
   */

  scrollToTop() {
    run('afterRender', () => window.scrollTo(0, 0));
  }

  /**
   * Scroll to element
   *
   * @param {string} selector Element ID to scroll to
   * @param {boolean} scroll [scroll=true] Use smooth scrolling (true) or jump scroll (false)
   * @param {boolean} scrollToTop Scroll the element to top regardless if element is in view.
   */

  scrollToElement(selector, scroll = true, scrollToTop = false) {
    run('afterRender', () => {
      const element = (selector instanceof Element) ? selector : document.querySelector(selector);
      if (!element) {
        return;
      }

      const {top, bottom} = element.getBoundingClientRect();

      if (bottom > window.innerHeight || top < 0) {
        element.scrollIntoView({behavior: scroll ? 'smooth' : 'auto'});
      } else if (scrollToTop) {
        // Element is already in view, scroll element mostly to the top.
        window.scroll({top: top + window.scrollY - 100, behavior: scroll ? 'smooth' : 'auto'});
      }
    });
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
   * Avoids common pitfalls and the weird undocumented special-sauce format that must be used with the built in pushPayload
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
      document.body.append(script);
      script.addEventListener('load', () => {
        this.cachedScripts[url] = true;
        resolve();
      });
      script.addEventListener('error', () => reject());
      script.src = url; // Boom!
    });
  }

  /**
   * Toggle all accordions on the page
   */

  toggleAllAccordions(show) {
    this.collapse('.acccordion-body', show ? 'show' : 'hide');
  }

  toggleSingleAccordion(containerId, show) {
    this.collapse(`${containerId} .accordion-body`, show ? 'show' : 'hide');
    this.scrollToElement(containerId, true);
  }

  collapse(selector, action) {
    run('afterRender', () => {
      if (typeof (selector) === 'string') {
        document.querySelectorAll(selector).forEach((element) => {
         bootstrap.Collapse.getOrCreateInstance(element, { toggle: false})[action]();
        })
      } else {
        bootstrap.Collapse.getOrCreateInstance(selector, { toggle: false})[action]();
      }
    });
  }
}
