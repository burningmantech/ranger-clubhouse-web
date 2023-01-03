import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, VC} from 'clubhouse/constants/roles';
import RSVP from 'rsvp';

export default class PersonPhotosRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, VC];

  model() {
    const person_id = this.modelFor('person').id;

    this.store.unloadAll('person-photo');

    return RSVP.hash({
      photos: this.store.query('person-photo', {person_id}),
      review_config: this.ajax.request('person-photo/review-config').then(({review_config}) => review_config)
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('person', this.modelFor('person'));
    controller.set('photos', model.photos);
    controller.set('review_config', model.review_config);
    controller.set('photo', null);

    controller.set('rejectionLabels', {});
    model.review_config.rejections.forEach((r) => controller.rejectionLabels[r.key] = r.label);
  }
}
