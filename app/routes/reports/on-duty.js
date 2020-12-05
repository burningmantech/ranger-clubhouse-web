import Route from '@ember/routing/route';
import _ from 'lodash';

export default class ReportsOnDutyRoute extends Route {
  queryParams = {
    over_hours: {refreshModel: true},
    duty_date: {refreshModel: true}
  };

  model({over_hours, duty_date}) {
    const data = {};

    if (duty_date) {
      data.duty_date = duty_date;
    } else {
      data.is_on_duty = 1;
    }

    this.duty_date = duty_date;

    over_hours = parseInt(over_hours);
    if (over_hours) {
      data.over_hours = over_hours;
    }

    return this.ajax.request('timesheet', {data});
  }

  setupController(controller, model) {
    const positions = _.sortBy(_.map(_.groupBy(model.timesheet, (ts) => ts.position.title), (timesheets, title) => {
      return {title, timesheets};
    }), ['title']);

    controller.set('positions', positions);
    controller.set('dateForm', {date: this.duty_date});
    controller.set('timesheet', model.timesheet);
    controller.set('expandAll', false);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('over_hours', null);
      controller.set('duty_date', null);
    }
  }
}
