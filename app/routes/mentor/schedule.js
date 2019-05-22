import Route from '@ember/routing/route';
import { action } from '@ember/object';

import requestYear from 'clubhouse/utils/request-year';

export default class MentorScheduleRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);

    this.set('year', year);
    return this.ajax.request('mentor/alpha-schedule', { data: { year, exclude_photo: true } });
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

  @action
  refreshRoute() {
    this.refresh();
  }
}
