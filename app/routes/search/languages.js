import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class SearchLanguagesRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('person-language/common-languages');
  }

  setupController(controller, model) {
    controller.searchForm = {
      language: '',
      offSite: false
    };
    controller.isLoading = false;
    controller.searchingOffSite = false;
    controller.commonLanguages = model.languages;
  }
}
