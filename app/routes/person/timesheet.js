import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';
import {ADMIN, TIMESHEET_MANAGEMENT} from "clubhouse/constants/roles";
import {TRAINING} from "clubhouse/constants/positions";

export default class PersonTimesheetRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    const person_id = this.modelFor('person').id;
    const queryParams = {
      person_id,
      year,
    };

    this.store.unloadAll('timesheet');
    this.store.unloadAll('timesheet-missing');

    const timesheetQuery = { person_id, year, check_times: 1 };
    if (this.session.hasRole([ ADMIN, TIMESHEET_MANAGEMENT])) {
      timesheetQuery.include_admin_notes = 1;
    }
    return RSVP.hash({
      year: year,
      timesheets: this.store.query('timesheet', timesheetQuery),
      timesheetInfo: this.ajax.request('timesheet/info', { data: { person_id } })
        .then((result) => result.info),
      timesheetMissing: this.store.query('timesheet-missing', queryParams),
      positions: this.ajax.request(`person/${person_id}/positions`,{ data: { include_mentee: 1, include_training: 1, year } })
        .then((results) => results.positions.filter((p) => p.id !== TRAINING)),
      timesheetSummary: this.ajax.request(`person/${person_id}/timesheet-summary`, { data: { year }})
        .then((result) => result.summary),
      eventInfo: this.ajax.request(`person/${person_id}/event-info`, { data: { year } })
        .then((result) => result.event_info)
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
    controller.person = this.modelFor('person');
    controller._findOnDuty();
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
