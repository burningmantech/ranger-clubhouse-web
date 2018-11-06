import Route from '@ember/routing/route';

//
// Called by Ember when a route encounters an uncaught exception.
//
// Note this is *not* listed in app/router.js

export default class ErrorRoute extends Route {
  setupController(controller, error) {
    super.setupController(...arguments);
    console.error('Uncaught routing error', error);
    controller.set('error', error);
  }
}
