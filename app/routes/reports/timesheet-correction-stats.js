import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN, TIMESHEET_MANAGEMENT} from "clubhouse/constants/roles";
import requestYear from "clubhouse/utils/request-year";

export default class ReportsTimesheetCorrectionStatsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, TIMESHEET_MANAGEMENT];

  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('timesheet/correction-statistics', {data: {year}});
  }

  setupController(controller, model) {
    controller.year = this.year;
    controller.statistics = model.statistics;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.year = null;
    }
  }
}
