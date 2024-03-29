import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsLanguagesRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('person-language/on-site-report');
  }

  setupController(controller, {languages}) {
    controller.languageGroups = [
      {title: 'Common Languages Encountered On Playa', languages: languages.common},
      {title: 'Other Languages', languages: languages.other},
    ]
  }
}
