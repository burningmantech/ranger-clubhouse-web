import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
E
export default class ReportsOnDutyRoute extends ClubhouseRoute {
  queryParams = {
    has_excessive_duration: {refreshModel: true},
    duty_date: {refreshModel: true}
  };

  model({has_excessive_duration, duty_date}) {
    const data = {};

    if (duty_date) {
      data.duty_date = duty_date;
      this.duty_date = duty_date;
    } else {
      this.duty_date = null;
    }

    if (has_excessive_duration) {
      data.has_excessive_duration = 1;
    }

    return this.ajax.request('timesheet/on-duty-report', {data});
  }

  setupController(controller, model) {
    controller.positions = model.positions;
    controller.totalPeople = model.total_people;
    controller.dateForm = {date: this.duty_date};
    controller.expandAll = false;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.duty_date = null;
    }
  }
}
