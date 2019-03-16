import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class TrainingIndexRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const training = this.modelFor('training');
    const year = requestYear(params);

    return RSVP.hash({
      trainingSessions: this.ajax.request('training-session/sessions', {
        data: { year, training_id: training.id }
      }).then((results) => results.sessions),
      year
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('training', this.modelFor('training'));
    controller.setProperties(model);
  }

  // Don't allow the year parameter to bleed over to other routes.
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
