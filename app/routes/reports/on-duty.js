import Route from '@ember/routing/route';
import _ from 'lodash';

export default class ReportsOnDutyRoute extends  Route {
  queryParams = {
    over_hours: { refreshModel: true }
  };

  model({ over_hours }) {
    const data = { on_duty: 1};

    over_hours = parseInt(over_hours);
    if (over_hours) {
      data.over_hours = over_hours;
    }

    return this.ajax.request('timesheet', { data });
  }

  setupController(controller, model) {
    const positions = _.sortBy(_.map(_.groupBy(model.timesheet, (ts) => ts.position.title), (timesheets,title) =>  {
      return { title, timesheets };
    }), ['title']);

    controller.set('positions', positions);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('over_hours', null);
    }
  }
}
