import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class OpsRollcallRoute extends ClubhouseRoute {
  setupController(controller) {
    controller.isSignOut = false;
    controller.isSignIn = false;
  }
}
