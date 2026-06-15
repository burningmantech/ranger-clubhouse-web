import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsEventsRangeredRoute extends ClubhouseRoute {
  queryParams = {
    showAll: { refreshModel: true }
  };

  model(params) {
    const query = {};
    if (params.showAll) {
      query.include_all = 1;
      this.showAll = 1;
    } else {
      this.showAll = 0;
    }
    return this.ajax.request(`timesheet/events-rangered`, { data: query });
  }

  setupController(controller, model) {
    controller.set('events_rangered', model.events_rangered);
    controller.set('signed_up_year', model.signed_up_year);
    controller.set('showAll', this.showAll);
  }

  resetController(controller, isExiting) {
    if (!isExiting) {
      return;
    }

    controller.set('showAll', false);
  }
}
