import Service from '@ember/service';
import ENV from 'clubhouse/config/environment';
import {inject as service} from '@ember/service';
import {isAbortError, isTimeoutError} from 'ember-ajax/errors';
import {isArray} from '@ember/array';
import {run} from '@ember/runloop';
import {isEmpty} from '@ember/utils';
import currentYear from 'clubhouse/utils/current-year';
import {Role} from 'clubhouse/constants/roles';
import {isChangeset} from 'validated-changeset';
import {InvalidError, ServerError, TimeoutError, AbortError, NotFoundError} from '@ember-data/adapter/error'
import $ from 'jquery';

export default class HouseService extends Service {
  @service toast;
  @service session;
  @service router;
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

    if (response.status == 401 && this.session.isAuthenticated) {
      this.toast.warn('Your session has timed out. Please login again.')
      this.session.invalidate();
      return;
    }

    // Ember Data request error
    if (response instanceof InvalidError) {
      responseErrors = response.errors.map((error) => error.title);
      errorType = 'validation';
      if (changeSet && response.errors) {
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
      isTimeoutError(response)) {
      // Ajax Error
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
          if (changeSet && response.payload && response.payload.errors) {
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

      const plural = responseErrors.length == 1 ?
        ' was' :
        's were';
      message = `The following ${errorType} error${plural} encountered:`;
      if (responseErrors.length == 1) {
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
   * @param {DS.Model|Changeset} model
   * @param {string} successMessage A toast message to show on success
   * @param {string|function} routeOrCallback Route to transition to or callback function
   * @returns {Promise<unknown>}
   */

  saveModel(model, successMessage, routeOrCallback) {
    this.toast.clear();

    const isCallback = typeof (routeOrCallback) == 'function';

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
   * Check to see if the user has one or more roles assigned
   *
   * @param {number[]} roles
   * @returns {boolean} true if the user has permission, otherwise return false and transition to the home page.
   */
  roleCheck(roles) {
    if (this.session.user.hasRole(roles)) {
      return true;
    }

    this.toast.error('You are not authorized for that action');
    this.router.transitionTo('me.overview');
    return false;
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
      if (typeof column == 'string') {
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

  /*
   * Download a file
   */

  downloadFile(filename, contents, type) {
    let {
      document,
      URL
    } = window;
    let anchor = document.createElement('a');

    anchor.download = filename;
    anchor.href = URL.createObjectURL(new Blob([contents], {
      type
    }));

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  /*
   * Scroll to top
   */

  scrollToTop() {
    run.schedule('afterRender', () => {
      window.scrollTo(0, 0);
    });
  }

  /*
   * Scroll to element
   */

  scrollToElement(selector, scroll = true) {
    run.schedule('afterRender', () => {
      const element = document.querySelector(selector);
      if (!element) {
        return;
      }

      element.scrollIntoView({behavior: scroll ? 'smooth' : 'auto'});

      // Only scroll if the element is not in view
      const rect = element.getBoundingClientRect();
      if (!(
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      )) {
        // Get the y axis, and leave a little space for the header.
        const y = rect.top + window.scrollY - 80;
        window.scroll({
          top: y,
          left: 0,
          behavior: scroll ? 'smooth' : 'auto'
        });
      }
    });
  }

  /*
   * Obtain the current year
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
   * From https://gist.github.com/runspired/96618af26fb1c687a74eb30bf15e58b6/
   */

  pushPayload(modelName, rawPayload) {
    return this.store.push(this.store.normalize(modelName, rawPayload));
  }

  get canViewEmail() {
    return this.session.user && this.session.user.hasRole([Role.ADMIN, Role.VIEW_PII, Role.VIEW_EMAIL]);
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
    $('.accordion-body').collapse(show ? 'show' : 'hide');
  }

  toggleSingleAccordion(containerId, show) {
    $(`${containerId} .accordion-body`).collapse(show ? 'show' : 'hide');
    this.scrollToElement(containerId, true);
  }
}
