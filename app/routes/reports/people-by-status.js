import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsPeopleByStatusRoute extends ClubhouseRoute {
    model() {
      return this.ajax.request('person/by-status');
    }

    setupController(controller,model) {
      controller.set('statuses', model.statuses);
    }
}
