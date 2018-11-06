import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class TrainingMultipleEnrollmentsRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const training = this.modelFor('training');
    const year = (params.year || (new Date).getFullYear());

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
}
