import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import currentYear from 'clubhouse/utils/current-year';
import {TIMECARD_YEAR_ROUND} from "clubhouse/constants/roles";

export default class MeTimesheetRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  async model(params) {
    const year = requestYear(params);
    const person_id = this.session.userId;
    const queryParams = {person_id, year};

    this.store.unloadAll('timesheet');

    // Figure out if timesheet corrections are enabled, and for what year.
    const timesheetInfo = (await this.ajax.request('timesheet/info', {
      method: 'GET',
      data: {person_id}
    })).info;

    const data = {
      timesheetInfo,
      year,
      person: this.session.user
    };

    data.timesheetSummary = (await this.ajax.request(`person/${person_id}/timesheet-summary`, {data: {year}})).summary;
    data.timesheets = await this.store.query('timesheet', queryParams);
    data.eventInfo = (await this.ajax.request(`person/${person_id}/event-info`, {data: {year}})).event_info;

    data.timecardYearRound = this.session.hasRole(TIMECARD_YEAR_ROUND) && (data.eventInfo.event_period !== 'before-event');

    // When corrections are enabled or if the person has the Timecard Year Round permission (NVO personnel),
    // pull in timesheet entries, missing requests,and person positions (for missing requests)

    if (timesheetInfo.correction_enabled || data.timecardYearRound) {
      this.store.unloadAll('timesheet-missing');

      data.timesheetsMissing = await this.store.query('timesheet-missing', queryParams);
      data.positions = (await this.ajax.request(`person/${person_id}/positions`, {data: {include_mentee: 1}})).positions;

      if (data.timecardYearRound) {
        timesheetInfo.correction_enabled = true;
      }
    } else {
      data.positions = [];
      data.timesheetsMissing = [];
    }

    return data;
  }

  setupController(controller, model) {
    controller.setProperties(model);
    controller.finalConfirmation = model.timesheetInfo.timesheet_confirmed;
    controller.confirmedAt = model.timesheetInfo.timesheet_confirmed_at;
    controller.isCurrentYear = currentYear() === +model.year;
    controller.askForFinalConfirmation = (model.eventInfo.event_period !== 'before-event');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
