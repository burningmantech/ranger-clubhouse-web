import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsFlakesRoute extends ClubhouseRoute {
  queryParams = {
    date: { refreshModel: true }
  };

  model({ date }) {
    const data = date ? { date } : {};

    return this.ajax.request('slot/flakes', { data });
  }

  setupController(controller, model) {
    controller.set('positions', model.positions);
    controller.set('date', model.date);
    controller.set('dateForm', { date: model.date });
    controller.set('expandAll', false);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('date', null);
    }
  }
}
