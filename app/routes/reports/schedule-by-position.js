import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsScheduleByPositionRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);

    this.year = year;
    return this.ajax.request('slot/position-schedule-report', { data: { year }}).then(({positions}) => positions);
  }

  setupController(controller, model) {
    model.forEach((p) => {
      p.activeCount = p.slots.filter((s) => s.active).length;
      p.inactiveCount = p.slots.length - p.activeCount;
    });

    controller.set('year', this.year);
    controller.set('positions', model);
    controller.set('isExpanding', false);
    controller.set('expandAll', false);
    controller.set('activeFilter', 'active');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
