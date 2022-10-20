import {TimeoutError, AbortError, ForbiddenError, UnauthorizedError} from '@ember-data/adapter/error';
import {isAbortError, isForbiddenResponse, isUnauthorizedResponse} from 'ember-fetch/errors';
import config from 'clubhouse/config/environment';

/**
 * Send an error down to the server for later diagnoses.
 *
 * error may be one of several types
 * - ember-model error
 * - ember-ajax error
 * - Javascript exception
 *
 * @param error
 * @param type string event error name (e.g., client-ember-route, client-window-exception, etc.)
 * @param additionalData - additional data to log
 */

export default function logError(error, type, additionalData = null) {
  if (!config.logEmberErrors) {
    // Might be in a development or test environment. skip logging.
    return;
  }

  const {message, stack, name, filename} = error.error ?? error;

  if (
    // ember-model errors
    error instanceof TimeoutError
    || error instanceof AbortError
    || error instanceof ForbiddenError
    || error instanceof UnauthorizedError
    // ember-ajax errors
    || isAbortError(error)
    || isAbortError(error)
    || isForbiddenResponse(error)
    || isUnauthorizedResponse(error)
    // Offline errors..
    || error.name === 'NetworkError'
    || message?.match(/NetworkError/)
    || message?.match(/Network request failed/i)
    // Authorization error
    || error.status === 403) {
    // Don't record timeouts, unauthorized requests (aka expired authorization tokens), or offline errors.
    return;
  }

  const form = new FormData;
  form.append('url', window.location.href);
  form.append('error_type', type);

  const data = {
    exception: {name, message, stack, filename},
    build_timestamp: config.APP.buildTimestamp,
    version: config.APP.version,
  };

  if (additionalData !== null) {
    data.additional = additionalData;
  }

  form.append('data', JSON.stringify(data));

  try {
    // Grab the logged-in user id if possible.
    const personId = window.Clubhouse.__container__.lookup('service:session')?.user?.id;
    if (personId) {
      form.append('person_id', personId);
    }
  } catch (exception) {
    console.error('Session user id exception', exception);
  }

  const url = config['api-server'] + '/error-log/record';

  if ('sendBeacon' in navigator) {
    // sendBeacon will continue even if the browser window is closed.
    navigator.sendBeacon(url, form);
  } else {
    // For Safari 11.1 and earlier, Internet Explorer, and other older browsers use good old XMLHttpRequest.
    // If the window is closed before the request is completed, the request may be aborted hence why
    // sendBeacon is preferred.
    try {
      const req = new XMLHttpRequest();
      req.open('POST', url);
      req.setRequestHeader('Accept', '*/*');
      req.send(form);
    } catch (exception) {
      console.error('LOG ERROR', exception);
    }
  }
}
