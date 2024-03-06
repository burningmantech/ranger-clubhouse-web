import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

/*
 * The catch all route for unrecognized urls
 */

export default class NotFoundRoute extends ClubhouseRoute {
  setupController(controller) {
    const href = window.location.href;
    controller.url = href
    controller.isOldURL = href.match(/\/clubhouse\//);
  }
}
