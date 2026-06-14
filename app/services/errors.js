import Service, {service} from '@ember/service';
import ENV from 'clubhouse/config/environment';
import {isAbortError} from 'clubhouse/utils/ajax/response-errors';
import {isArray} from '@ember/array';
import {AbortError, InvalidError, NotFoundError, ServerError, TimeoutError} from '@ember-data/adapter/error';
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

/**
 * Maps an API failure to a user-facing dialog, and field errors back onto a
 * changeset. The one deep module from the legacy house split.
 */

export default class ErrorsService extends Service {
  @service modal;
  @service scroll;
  @service session;

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
        this.scroll.scrollToElement('.is-invalid');
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
            this.scroll.scrollToElement('.is-invalid');
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
}
