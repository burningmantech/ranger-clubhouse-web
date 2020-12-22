import Route from '@ember/routing/route';

export default class SearchLanguagesRoute extends Route {
  setupController(controller) {
    controller.set('searchForm', {
      language: '',
      offSite: false
    });
  }
}
