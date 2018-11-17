import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class MeTimesheetMissingRoute extends Route {
  model() {
    const parent = this.modelFor('me.timesheet');
    const person_id = this.session.user.id;
    const queryParams = {
      person_id: this.session.user.id,
      year: parent.year,
    };

    return RSVP.hash({
      timesheetsMissing: this.store.query('timesheet-missing', queryParams).then((result) => result.toArray()),
      positions: this.ajax.request(`person/${person_id}/positions`).then((result) => result.positions)
    });
  }

  setupController(controller, model) {
    const parent = this.modelFor('me.timesheet');
    super.setupController(...arguments);
    controller.setProperties(parent);
    controller.setProperties(model);
    controller.set('canCorrectThisYear', (parent.timesheetInfo.correction_year == parent.year));
  }
}
