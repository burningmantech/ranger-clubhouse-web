import Service from '@ember/service';
import ENV from 'clubhouse/config/environment';
import {
  inject as service
} from '@ember-decorators/service';
import {
  isAbortError,
  isTimeoutError
} from 'ember-ajax/errors';
import {
  isArray
} from '@ember/array';
import {
  run
} from '@ember/runloop';
import { isEmpty } from '@ember/utils';

import DS from 'ember-data';

export default class HouseService extends Service {
  @service toast;
  @service session;
  @service router;
  @service store;

  /*
   * Handle an error response from either an ajax request or an Ember Data request.
   */

  handleErrorResponse(response) {
    let message, errorType;
    let responseErrors = null;

    if (ENV.showAjaxErrors) {
      console.error(response);
    }

    // Ember Data request error
    if (response instanceof DS.InvalidError) {
      responseErrors = response.errors.map((error) => error.title);
      errorType = 'validation';
    } else if (response instanceof DS.ServerError) {
      if (response.errors) {
        responseErrors = response.errors.map((error) => error.title);
      } else {
        responseErrors = 'The record operation was unsuccessful due to a fatal server error';
      }
      errorType = 'server';
    } else if (response instanceof DS.TimeoutError ||
      response instanceof DS.AbortError ||
      isAbortError(response) ||
      isTimeoutError(response)) {
      // Ajax Error
      responseErrors = 'The request to the Clubhouse server could not be completed. The server might be offline or the Internet connection is spotty.';
      errorType = 'server';
    } else if (response instanceof DS.NotFoundError) {
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
        errorType = 'authorization'
        break;

      case 403:
        errorType = 'not permitted';
        break;

      case 422:
        errorType = 'validation';
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
      this.handleErrorResponse(response);
    });
  }

  roleCheck(roles) {
    if (this.session.user.hasRole(roles)) {
      return true;
    }

    this.toast.error('You are not authorized for that action');
    this.router.transitionTo('me.overview');
    return false;
  }

  /*
   * Download an array as a CSV file.
   */

  downloadCsv(filename, columns, data) {
    const headers = columns.map((column) => {
      if (typeof column == 'string') {
        return column;
      } else {
        return column.title;
      }
    });

    let contents = headers.join(',')+"\n";

    data.forEach((line) => {
      let fields = [];
      columns.forEach((column) => {
        let value;
        if (typeof column == 'string') {
          value = line[column];
        } else {
          value = line[column.key];
        }

        value = isEmpty(value) ? '' : value.toString();

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

  scrollToElement(selector) {
    run.schedule('afterRender', () => {
      const element = document.querySelector(selector);
      if (!element) {
        return;
      }

      // Only scroll if the element is not in view
      const rect = element.getBoundingClientRect();
      if (!(
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      )) {
        // Get the y axis, and leave a little space for the header.
        const y = rect.top + window.scrollY - 20;
        window.scroll({
          top: y,
          left: 0,
          behavior: 'smooth'
        });
      }
    });
  }

  /*
   * Obtain the current year
   */

   currentYear() {
     return (new Date()).getFullYear();
   }

   _getStorage() {
     let storage;

     try {
       storage = window.sessionStorage.getItem('clubhouse');

       if (storage) {
         storage = JSON.parse(storage);
       }
     } catch (e) {
       // browser blocking sessionStorage or not available.
       return {};
     }


     return storage || { };
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
       window.sessionStorage.setItem('clubhouse', JSON.stringify(storage));
     } catch (e) {
       // browser blocking sessionStorage or not available.
     }
   }

   getKey(key) {
     return this._getStorage()[key];
   }

   clearStorage() {
     try {
       window.sessionStorage.removeItem('clubhouse');
     } catch (e) {
       // browser blocking sessionStorage or not available.
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
}
