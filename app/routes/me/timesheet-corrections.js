import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import RSVP from 'rsvp';

export default class MeTimesheetCorrectionsRoute extends Route.extend(MeRouteMixin) {
  async model() {
    const person_id = this.session.user.id;

    // Figure out if timesheet corrections are enabled, and for what year.
    const timesheetInfo = await this.ajax.request('timesheet/info', {
      method: 'GET',
      data: { person_id }
    }).then((result) => result.info);

    const data = {
      timesheetInfo,
      person: this.session.user
    };

    // When corrections are enabled, pull in timesheet entries, missing requests,
    // and person positions (for missing requests)

    if (timesheetInfo.correction_enabled) {
      const queryParams = { person_id, year: timesheetInfo.correction_year };

      this.store.unloadAll('timesheet');
      this.store.unloadAll('timesheet-missing');

      data.timesheets = this.store.query('timesheet', queryParams);
      data.timesheetsMissing = this.store.query('timesheet-missing', queryParams).then((result) => result.toArray());
      data.positions =  this.ajax.request(`person/${person_id}/positions`).then((result) => result.positions);

      return RSVP.hash(data);
    } else {
      data.timesheets = [ ];
      data.timesheetsMissing = [];
      data.positions = [];

      return data;
    }
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
  }
}
