import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';

export default class TrainingCapacityRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const training = this.modelFor('training');
    const year = requestYear(params);

    return RSVP.hash({
        slots: this.ajax.request(`training/${training.id}/capacity`, { data: {year} })
          .then((results) => results.slots)
          .catch((response) => { this.house.handleErrorResponse(response); }),
        year
      });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('slots', model.slots);
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
