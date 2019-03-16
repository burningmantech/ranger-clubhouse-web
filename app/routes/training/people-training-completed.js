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
    }).then((results) => {
      results.year = year;
      return results;
    });
  }

  setupController(controller, model) {
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
