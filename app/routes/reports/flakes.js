import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsFlakesRoute extends ClubhouseRoute {
  queryParams = {
    date: {refreshModel: true}
  };

  model({date}) {
    const data = date ? {date} : {};

    return this.ajax.request('slot/flakes', {data});
  }

  setupController(controller, model) {
    controller.positions = model.positions;
    controller.date = model.date;
    controller.dateForm = {date: model.date};
    controller.positionsScrollList = model.positions.map((p) => ({id: `position-${p.id}`, title: p.title}));
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('date', null);
    }
  }
}
