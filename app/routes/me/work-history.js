import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeWorkHistoryRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('timesheet', {data: {person_id: this.session.userId}})
  }

  setupController(controller, {timesheet}) {
    controller.set('timesheet', timesheet);
    controller.set('person', this.session.user);
  }
}
