import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, VC} from 'clubhouse/constants/roles';
import RSVP from 'rsvp';

export default class VcPhotoReviewRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, VC];

  model() {
    return RSVP.hash({
      person_photo: this.store.query('person-photo', {status: 'submitted', include_rejects: 1}),
      review_config: this.ajax.request('person-photo/review-config').then(({review_config}) => review_config)
    });
  }

  setupController(controller, model) {
    const personPhotos = model.person_photo;

    super.setupController(...arguments);

    controller.setProperties(personPhotos.meta);
    controller.set('person_photo', personPhotos);
    controller.set('review_config', model.review_config);

    model.person_photo.forEach((photo) => {
      // Save off the rejection history to another area where it will not
      // be blown away when save() is called.
      photo.rejection_history = photo.reject_history;
    });

    controller.reviewPhoto = null;

    controller.rejectionLabels = {};
    model.review_config.rejections.forEach((r) => {
      controller.rejectionLabels[r.key] = r.label;
    });
  }
}
