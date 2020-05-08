import {TimeoutError, AbortError, UnauthorizedError} from '@ember-data/adapter/error';
import Ember from 'ember';
import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'clubhouse/config/environment';
import LinkComponent from '@ember/routing/link-component';
import RSVP from 'rsvp';
import buildErrorHandler from 'ember-test-friendly-error-handler';
import {isAbortError, isTimeoutError} from 'ember-ajax/errors';


RSVP.on('error', function (error) {
  // TODO: keep an eye on this
  // https://github.com/emberjs/ember.js/issues/12505
  if (error.name !== 'TransitionAborted') {
    console.error('RSVP Exception', error.stack);
    alert('RSVP Exception: ' + error.stack);
  }
});


/*
 * Attempt to trap any non-recoverable errors and log them to the server.
 *
 * Uses sendBeacon which is completely asynchronous and will continue to work
 * after the browser window is closed.
 */

Ember.onerror = buildErrorHandler('Ember.onerror', (error) => {
  var didAlertError = false;

  if (Ember.testing) { // eslint-disable-line ember/no-ember-testing-in-module-scope
    throw error;
  }
  console.error(error);

  if ((error instanceof TimeoutError
    || error instanceof AbortError
    || isAbortError(error)
    || isTimeoutError(error)
    || error instanceof UnauthorizedError)) {
    // Don't record timed out, unauthorized, or offline errors.
    return;
  }

  if (config.logEmberErrors) {
    const data = new FormData;

    data.append('url', window.location.href);
    data.append('error_type', 'ember-onerror');
    data.append('data', JSON.stringify({
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
      const personId = window.Clubhouse.__container__.lookup('service:session').get('user.id')
      data.append('person_id', personId);
    } catch (exception) {
      // eslint-disable-line no-empty
    }

    navigator.sendBeacon(config['api-server'] + '/error-log/record', data);
  }

  if (config.environment == 'development') {
    if (!didAlertError) {
      didAlertError = true;
      alert("Exception " + error.stack);
      debugger;  // eslint-disable-line no-debugger
    }
  } else {
    alert("Exception " + error.stack);
  }
});

LinkComponent.reopen({
  activeClass: 'is_active'
});

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
