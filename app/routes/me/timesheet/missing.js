import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class MeTimesheetMissingRoute extends Route {
  model(params) {
    const parent = this.modelFor('me.timesheet');
    const person_id = this.session.user.id;
    const queryParams = {
      person_id: this.session.user.id,
      year: parent.year,
    };

    return RSVP.hash({
      timesheetsMissing: this.store.query('timesheet-missing', queryParams),
      positions: this.ajax.request(`person/${person_id}/positions`).then((results) => results.positions)
    });
  }

  setupController(controller, model) {
    const parent = this.modelFor('me.timesheet');
    super.setupController(...arguments);
    controller.setProperties(parent);
    controller.set('canCorrectThisYear', (parent.timesheetInfo.correction_year == parent.year));
    controller.set('timesheetsMissing', model.timesheetsMissing);
    controller.set('positions', model.positions)
  }
}
