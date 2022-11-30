import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';

export default class PersonWorkHistoryRoute extends ClubhouseRoute {
  model() {
    const person_id = this.modelFor('person').id;

    return RSVP.hash({
      timesheet: this.ajax.request('timesheet', {data: {person_id}}).then(({timesheet}) => timesheet),
      membershipHistory: this.store.query('person-team-log', {person_id, teams_only: 1}),
      teams: this.ajax.request('team').then(({team}) => team)
    });
  }

  setupController(controller, {timesheet, membershipHistory, teams}) {
    controller.set('person', this.modelFor('person'));
    controller.set('timesheet', timesheet);
    controller.set('membershipHistory', membershipHistory);
    controller.set('teams', teams);
    controller.set('teamEntry', null);
  }
}
