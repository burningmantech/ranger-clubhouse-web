import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsLanguagesRoute extends ClubhouseRoute {
    model() {
      return this.ajax.request('person/languages');
    }

    setupController(controller,model) {
      controller.set('languages', model.languages);
    }
}
