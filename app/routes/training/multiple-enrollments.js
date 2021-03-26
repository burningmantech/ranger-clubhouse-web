import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';

export default class TrainingMultipleEnrollmentsRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const training = this.modelFor('training');
    const year = requestYear(params);

    return RSVP.hash({
        enrollments: this.ajax.request(`training/${training.id}/multiple-enrollments`, { data: {year} })
          .then((results) => results.enrollments)
          .catch((response) => this.house.handleErrorResponse(response)),
        year
      });
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
