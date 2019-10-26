import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class AdminManualReviewRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck(Role.ADMIN);
  }

  model(params) {
    const year = requestYear(params);
    this.year = year;

    return RSVP.hash({
      mr: this.ajax.request('manual-review', { data: { year } }),
      config: this.ajax.request('manual-review/config')
    });
  }

  setupController(controller, model) {
    controller.set('showPNVs', false);
    controller.set('showAll', false);
    controller.set('showSpreadsheet', false);
    controller.set('year', this.year);
    controller.set('manual_review', model.mr.manual_review);
    controller.set('config', model.config);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
