import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, VC} from 'clubhouse/constants/roles';

export default class VcPhotosRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, VC];
  queryParams = {
    page: {refreshModel: true},
  };


  async model({page}) {
    return {
      person_photo: await this.ajax.request('person-photo', {method: 'GET', data: {page}}),
      review_config: (await this.ajax.request('person-photo/review-config')).review_config
    };
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
