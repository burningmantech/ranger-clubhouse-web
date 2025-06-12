import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import durationOfTime from "clubhouse/utils/duration-of-time";
import requestYear from "clubhouse/utils/request-year";
import {ADMIN, TIMESHEET_MANAGEMENT} from "clubhouse/constants/roles";
import {createdVia} from "clubhouse/models/timesheet";

export default class ReportsEarlyLateCheckinsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, TIMESHEET_MANAGEMENT];

  queryParams = {year: {refreshModel: true}};

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('timesheet/early-late-checkins', {data: {year}});
  }

  setupController(controller, model) {
    controller.year = this.year;
    controller.early_check_in = model.early_check_in;
    controller.late_check_in = model.late_check_in;
    controller.entries = model.entries;
    controller.entries.forEach((e) => {
      e.distanceHuman = durationOfTime(e.distance)
      e.createdVia = createdVia(e.timesheet.via);
    });
    controller.people = model.people;
    const positions = model.positions;
    const options = positions.map((p) => [`${p.title} (${p.total})`, p.id]);
    options.unshift(['All', 'all']);
    controller.positionOptions = options;
    controller.positionFilter = 'all';
    positions.sort((a, b) => b.total - a.total);
    controller.positions = positions;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.year = null;
    }
  }
}
