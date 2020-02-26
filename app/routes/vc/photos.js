import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class VcPhotosRoute extends Route {
  queryParams = {
    page: {refreshModel: true},
  };

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([Role.ADMIN, Role.VC]);
  }

  model({ page }) {
    return this.ajax.request('person-photo', { method: 'GET', data: { page }});
  }

  setupController(controller, model) {
    const meta = model.meta;
    controller.set('person_photo', model.person_photo);
    controller.set('total', meta.total);
    controller.set('currentPage', meta.page);
    controller.set('total_pages', meta.total_pages);
    controller.set('showPhoto', null);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('page', 1);
    }
  }
}
