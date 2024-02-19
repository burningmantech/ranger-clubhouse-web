import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class OpsRollcallRoute extends ClubhouseRoute {
  setupController(controller) {
    controller.set('isSignOut', false);
    controller.set('isSignIn', false);
  }
}
