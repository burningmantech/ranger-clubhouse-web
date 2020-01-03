import { TimeoutError, AbortError } from '@ember-data/adapter/error';
import Ember from 'ember';
import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import LinkComponent from '@ember/routing/link-component';
import RSVP from 'rsvp';
import buildErrorHandler from 'ember-test-friendly-error-handler';
import { isAbortError, isTimeoutError } from 'ember-ajax/errors';


RSVP.on('error', function(error) {
  // TODO: keep an eye on this
  // https://github.com/emberjs/ember.js/issues/12505
  if(error.name !== 'TransitionAborted') {
    console.error('RSVP Exception', error.stack);
    alert('RSVP Exception: '+error.stack);
  }
});


  /*
   * Attempt to trap any non-recoverable errors and log them to the server.
   *
   * Uses sendBeacon which is completely asynchronous and will continue to work
   * after the browser window is closed.
   */

  Ember.onerror = buildErrorHandler('Ember.onerror', (error) => {
    if (Ember.testing) { // eslint-disable-line ember/no-ember-testing-in-module-scope
      throw error;
    }
    console.error(error);

    const isOffline =
      (error instanceof TimeoutError || error instanceof AbortError
        || isAbortError(error) || isTimeoutError(error));

    if (isOffline) {
      // Don't record timed out, or offline errors.
      return;
    }

    if (config.logEmberErrors && navigator.sendBeacon) {
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

      navigator.sendBeacon(config['api-server']+'/error-log/record', data);
    }

    alert("Exception "+error.stack);
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
