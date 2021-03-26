import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';

export default class MeTimesheetRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    const person_id = this.session.userId;
    const queryParams = {
      person_id,
      year,
    };

    this.store.unloadAll('timesheet');

    return RSVP.hash({
      timesheets: this.store.query('timesheet', queryParams),
      timesheetInfo: this.ajax.request('timesheet/info', {
        method: 'GET',
        data: { person_id }
      }).then((result) => result.info),
      timesheetSummary: this.ajax.request(`person/${person_id}/timesheet-summary`, { data: { year }}).then((result) => result.summary),
      year: year,
    });
  }

  setupController(controller, model) {
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
