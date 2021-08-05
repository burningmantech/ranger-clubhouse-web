import {TimeoutError, AbortError, ForbiddenError, UnauthorizedError} from '@ember-data/adapter/error';
import {isAbortError, isTimeoutError, isForbiddenError, isUnauthorizedError} from 'ember-ajax/errors';
import config from 'clubhouse/config/environment';

/*
  Log an unresolved error to the backend for later diagnosis.
 */

export default function logError(error, type) {
  if (!config.logEmberErrors) {
    // Might be in a development or test environment. skip logging.
    return;
  }

  if (error instanceof TimeoutError  // check ember-model errors
    || error instanceof AbortError
    || error instanceof ForbiddenError
    || error instanceof UnauthorizedError
    || isAbortError(error)  // and ember-ajax errors
    || isTimeoutError(error)
    || isForbiddenError(error)
    || isUnauthorizedError(error)
    // Offline errors..
    || (error.name === 'NetworkError' || error.message?.match(/NetworkError/))
    || +error.status === 403) {
    // Don't record timeouts, unauthorized requests (aka expired authorization tokens), or offline errors.
    return;
  }

  const form = new FormData;
  form.append('url', window.location.href);
  form.append('error_type', type);

  form.append('data', JSON.stringify({
    exception: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    build_timestamp: config.APP.buildTimestamp,
    version: config.APP.version,
  }));

  try {
    // Grab the logged in user id if possible.
    const personId = window.Clubhouse.__container__.lookup('service:session').get('user.id');
    form.append('person_id', personId);
  } catch (exception) {
    console.error('Session user id exception', exception);
  }

  const url = config['api-server'] + '/error-log/record';

  if ('sendBeacon' in navigator) {
    // sendBeacon will continue even if the browser window is closed.
    navigator.sendBeacon(url, form);
  } else {
    // For Safari 11.1 and earlier, Internet Explorer, and other older browsers use good old XMLHttpRequest
    // if the window is closed before the request is completed, the request may be aborted hence why
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
