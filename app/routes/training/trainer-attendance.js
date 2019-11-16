import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';

export default class TrainingTrainingAttendanceRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    const training = this.modelFor('training');

    this.year = year;
    return this.ajax.request(`training/${training.id}/trainer-attendance`, {
      data: { year }
    });
  }

  setupController(controller, model) {
    controller.set('trainers', model.trainers);
    controller.set('training', this.modelFor('training'));
    controller.set('year', this.year);
  }

  // Don't allow the year parameter to bleed over to other routes.
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
