import Route from '@ember/routing/route';

export default class AdminActionLogRoute extends Route {
  setupController(controller) {
    controller.set('noResults', false);
  }
}
