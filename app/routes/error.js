import Route from '@ember/routing/route';
import ENV from 'clubhouse/config/environment';
import { isAbortError, isTimeoutError } from 'ember-ajax/errors';
import DS from 'ember-data';

//
// Called by Ember when a route encounters an uncaught exception.
//
// Note this is *not* listed in app/router.js

export default class ErrorRoute extends Route {
  setupController(controller, error) {
    super.setupController(...arguments);
    controller.set('error', error);
    controller.set('config', ENV);

    // Check for offline errors
    const isOffline =
      (error instanceof DS.TimeoutError || error instanceof DS.AbortError
        || isAbortError(error) || isTimeoutError(error));

    controller.set('isOffline', isOffline);

    if (!isOffline) {
      console.error('Uncaught routing error', error);
    }

    // Try to send the down the error to the server for logging
    if (!isOffline && ENV.logEmberErrors && navigator.sendBeacon) {
      const data = new FormData;

      data.append('error_type', 'ember-route-error');
      data.append('url', window.location.href);

      let route_error;
      if (error.stack) {
        route_error = {
          message: error.message,
          stack: error.stack
        };
      } else {
        route_error = error;
      }

      data.append('data', JSON.stringify({
        build_timestamp: ENV.APP.buildTimestamp,
        version: ENV.APP.version,
        route_error
      }));

      const personId = this.session.get('user.id');
      if (personId) {
        data.append('person_id', personId);
      }
      navigator.sendBeacon(ENV['api-server'] + '/error-log/record', data);
    }

  }
}
