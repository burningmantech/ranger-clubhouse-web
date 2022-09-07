import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import currentYear from 'clubhouse/utils/current-year';

export default class VcShinyPennyReportRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model({year}) {
    if (!year) {
      year = currentYear();
    }
    this.year = year;
    return this.ajax.request('intake/shiny-penny-report', {data: {year}});
  }

  setupController(controller, model) {
    controller.people = model.people;
    controller.year = this.year;
  }
}
