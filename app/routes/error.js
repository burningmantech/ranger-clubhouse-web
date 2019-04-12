import Route from '@ember/routing/route';
import ENV from 'clubhouse/config/environment';

//
// Called by Ember when a route encounters an uncaught exception.
//
// Note this is *not* listed in app/router.js

export default class ErrorRoute extends Route {
  setupController(controller, error) {

    super.setupController(...arguments);
    controller.set('error', error);
    controller.set('config', ENV);

    // Try to send the down the error to the server for logging
    if (ENV.logEmberErrors && navigator.sendBeacon) {
      const data = new FormData;

      data.append('error_type', 'ember-route-error');
      data.append('url', window.location.href);

      const route_error = {
        message: error.message,
        stack: error.stack
      };

      if (error.isAdapterError) {
        // Looks like an ember-data exception
        route_error.description = error.description;
        route_error.filename = error.fileName;
        route_error.line_number = error.lineNumber;
        route_error.name = error.name;
        route_error.number = error.number;
        route_error.code = error.code;
      }

      data.append('data', JSON.stringify({
        build_timestamp: ENV.APP.buildTimestamp,
        version: ENV.APP.version,
        user_agent: navigator.userAgent,
        route_error
      }));

      const personId = this.session.get('user.id');
      if (personId) {
        data.append('person_id', personId);
      }
      navigator.sendBeacon(ENV['api-server'] + '/error-log/record', data);
    }

    console.error('Uncaught routing error', error);
  }
}
