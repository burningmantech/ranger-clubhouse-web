import {TimeoutError, AbortError} from '@ember-data/adapter/error';
import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import ENV from 'clubhouse/config/environment';
import {isAbortError, isForbiddenResponse} from 'ember-fetch/errors';
import logError from 'clubhouse/utils/log-error';

//
// Called by Ember when a route encounters an uncaught exception.
//
// Note this is not registered in app/router.js and called explicitly by the Ember framework.

export default class ErrorRoute extends ClubhouseRoute {
  setupController(controller, error) {
    super.setupController(...arguments);
    controller.set('error', error);
    controller.set('config', ENV);

    // Check for offline errors
    const message = error.message;
    const isOffline = (error instanceof TimeoutError || error instanceof AbortError || isAbortError(error)
      || error.name === 'NetworkError'
      || message?.match(/NetworkError/)
      || message?.match(/Network request failed/i)
    );

    controller.set('isOffline', isOffline);
    controller.set('notAuthorized', (error && (isForbiddenResponse(error) || error.status === 403)));

    if (isOffline) {
      return false;
    }

    logError(error, 'client-ember-route-error');
  }
}
