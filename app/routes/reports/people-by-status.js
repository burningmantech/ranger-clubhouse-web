import Route from '@ember/routing/route';

export default class ReportsPeopleByStatusRoute extends Route {
    model() {
      return this.ajax.request('person/by-status');
    }

    setupController(controller,model) {
      controller.set('statuses', model.statuses);
    }
}
