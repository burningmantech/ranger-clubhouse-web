import Route from '@ember/routing/route';

export default class ReportsLanguagesRoute extends Route {
    model() {
      return this.ajax.request('person/languages');
    }

    setupController(controller,model) {
      controller.set('languages', model.languages);
    }
}
