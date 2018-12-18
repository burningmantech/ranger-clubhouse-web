import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';

export default class TrainingPeopleTrainingCompletedRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    const training = this.modelFor('training');

    return this.ajax.request(`training/${training.id}/people-training-completed`, {
      data: { year }
    });
  }

  setupController(controller, model) {
    controller.set('slots', model.slots);
    controller.set('training', this.modelFor('training'));
  }
}
