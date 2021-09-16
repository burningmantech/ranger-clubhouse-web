import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

import requestYear from 'clubhouse/utils/request-year';

export default class MentorScheduleRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);

    this.year = year;
    return this.ajax.request('mentor/alpha-schedule', { data: { year } });
  }

  setupController(controller, model) {
    controller.set('slots', model.slots);
    controller.set('year', this.year);
    controller.set('signupSheetSlot', null);
    controller.set('signedInSlot', null);
    controller.set('apparelSlot', null);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
