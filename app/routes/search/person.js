import Route from '@ember/routing/route';

export default class SearchPersonRoute extends Route {

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('searchForm.query', '');
  }
}
