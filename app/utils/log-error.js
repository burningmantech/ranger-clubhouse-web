import {TimeoutError, AbortError, ForbiddenError, UnauthorizedError} from '@ember-data/adapter/error';
import {isAbortError, isForbiddenResponse, isUnauthorizedResponse} from 'clubhouse/utils/ajax/response-errors';
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

  let message = '';
  if (error) {
    message = error.message;
  } else {
    error = {};
  }

  // Don't log timeouts, unauthorized requests, expired authorization tokens, offline situations, or cancelled requests.
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
    // Offline errors / poor signal strength errors.
    || error.name === 'NetworkError'
    || message?.match(/NetworkError/)
    || message?.match(/Network request failed/i)
    || message?.match(/Load fail(ure|ed)/i)
    || message?.match(/Failed to fetch/i)
    // the user hit the back button, another link was clicked, the cancel button in the browser bar was pushed,
    // or the browser window closed while a request was in flight.
    || (error.name === 'TypeError' && message === 'cancelled')
    // Authorization error
    || error.status === 403) {
    return;
  }

  const form = new FormData;
  form.append('url', window.location.href);
  form.append('error_type', type);

  const data = {
    name: error.name,
    exception: message,
    details: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    build_timestamp: config.APP.buildTimestamp,
    version: config.APP.version,
  };

  if (additionalData !== null) {
    data.additional = additionalData;
  }

  form.append('data', JSON.stringify(data));

  try {
    // Grab the logged-in user id if possible.
    const personId = window.Clubhouse?.lookup('service:session')?.user?.id;
    if (personId) {
      form.append('person_id', personId);
    } else {
      form.append('no_person', "true");
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
