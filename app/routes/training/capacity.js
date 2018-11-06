import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class TrainingCapacityRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const training = this.modelFor('training');
    const year = (params.year || (new Date).getFullYear());

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
}
