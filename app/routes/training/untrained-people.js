import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';

export default class TrainingUntrainedPeopleRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    const training = this.modelFor('training');

    return this.ajax.request(`training/${training.id}/untrained-people`, {
      data: { year }
    });
  }

  setupController(controller, model) {
    // model.not_signed_up - people who have not signed up for training
    // model.not_passed - people who have not passed
    controller.setProperties(model);
    controller.set('training', this.modelFor('training'));
  }

  // Don't allow the year parameter to bleed over to other routes.
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
