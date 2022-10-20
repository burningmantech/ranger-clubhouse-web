import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class SearchLanguagesRoute extends ClubhouseRoute {
  setupController(controller) {
    controller.set('searchForm', {
      language: '',
      offSite: false
    });
    controller.set('isLoading', false);
    controller.set('searchingOffSite', false);
  }
}
