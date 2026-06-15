import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class TrainingMultipleEnrollmentsRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  async model(params) {
    const training = this.modelFor('training');
    const year = requestYear(params);

    let enrollments;
    try {
      enrollments = (await this.ajax.request(`training/${training.id}/multiple-enrollments`, { data: {year} })).enrollments;
    } catch (response) {
      enrollments = this.errors.handleErrorResponse(response);
    }

    return { enrollments, year };
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('enrollments', model.enrollments);
    controller.set('year', model.year);
    controller.set('training', this.modelFor('training'));
  }

  // Don't allow the year parameter to bleed over to other routes.
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
