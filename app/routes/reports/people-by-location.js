import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsPeopleByLocationRoute extends ClubhouseRoute {
    queryParams = {
      year: { refreshModel: true }
    };

    model(params) {
      const year = requestYear(params);
      this.year = year;
      return this.ajax.request('person/by-location', { data: { year }});
    }

    setupController(controller, model) {
      controller.set('year', this.year);
      controller.set('people', model.people);
      controller.set('filter', 'all');
      controller.set('isExpanding', false);
    }

    resetController(controller, isExiting) {
      if (isExiting) {
        controller.set('year', null);
      }
    }
}
