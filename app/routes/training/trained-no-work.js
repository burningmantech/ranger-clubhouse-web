import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from "clubhouse/utils/request-year";

export default class TrainingTrainedNoWorkRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    const training = this.modelFor('training');

    return this.ajax.request(`training/${training.id}/trained-no-work`, {
      data: { year }
    }).then((results) => {
      results.year = year;
      return results;
    });
  }

  setupController(controller, model) {
    controller.year = model.year;
    controller.people = model.people;
    controller.no_positions = model.no_positions;
    controller.no_slots = model.no_slots;
    controller.no_trained = model.no_trained;
    controller.training =this.modelFor('training');
  }

  // Don't allow the year parameter to bleed over to other routes.
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
