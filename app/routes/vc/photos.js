import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';
import RSVP from 'rsvp';

export default class VcPhotosRoute extends Route {
  queryParams = {
    page: {refreshModel: true},
  };

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([Role.ADMIN, Role.VC]);
  }

  model({ page }) {
    return RSVP.hash({
      person_photo: this.ajax.request('person-photo', { method: 'GET', data: { page }}),
      review_config: this.ajax.request('person-photo/review-config').then((result) => result.review_config)
    });
  }

  setupController(controller, model) {
    const meta = model.person_photo.meta;
    controller.set('person_photo', model.person_photo.person_photo);
    controller.set('total', meta.total);
    controller.set('currentPage', meta.page);
    controller.set('total_pages', meta.total_pages);
    controller.set('showPhoto', null);

    controller.set('rejectionLabels', {});
    model.review_config.rejections.forEach((r) => {
      controller.rejectionLabels[r.key] = r.label;
    });

  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('page', 1);
    }
  }
}
