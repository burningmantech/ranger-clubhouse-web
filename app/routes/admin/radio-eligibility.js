import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class AdminRadioEligibilityRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;

    return this.ajax.request('timesheet/radio-eligibility', {data: {year}});
  }

  setupController(controller, {people, year_1, year_2, year_3, shift_lead_positions}) {
    controller.set('year', this.year);
    controller.setProperties({
      people, year_1, year_2, year_3, pandemicSkipped: (year_1 - year_3) > 2,
      shift_lead_positions
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
