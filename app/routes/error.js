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

    // Try to send the down the error to the server for logging
    if (true /*ENV.logEmberErrors*/ && navigator.sendBeacon) {
      const data = new FormData;

      data.append('error_type', 'ember-route-error');
      data.append('url', window.location.href);
      data.append('data', JSON.stringify(error));

      const personId = this.session.get('user.id');
      if (personId) {
        data.append('person_id', personId);
      }
      navigator.sendBeacon(ENV['api-server'] + '/error-log/record', data);
    }

    console.error('Uncaught routing error', error);
  }
}
