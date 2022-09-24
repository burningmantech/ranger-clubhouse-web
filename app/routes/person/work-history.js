import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class PersonWorkHistoryRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('timesheet', {data: {person_id: this.modelFor('person').id}})
  }

  setupController(controller, {timesheet}) {
    controller.set('timesheet', timesheet);
    controller.set('person', this.modelFor('person'));
  }
}
