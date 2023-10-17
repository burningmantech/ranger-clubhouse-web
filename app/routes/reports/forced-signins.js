import ClubhouseRoute  from "clubhouse/routes/clubhouse-route";
import requestYear from "clubhouse/utils/request-year";

export default class ReportsForcedSigninsRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  }

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('timesheet/forced-signins-report', { data: { year }} );
  }

  setupController(controller, model) {
    controller.year = this.year;
    controller.entries = model.entries;
  }
}
