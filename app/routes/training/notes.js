import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import requestYear from "clubhouse/utils/request-year";

export default class TrainingNotesRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    this.year = requestYear(params);

    return this.ajax.request(`training/${this.modelFor('training').id}/notes`, {data: {year: this.year}});
  }

  setupController(controller, model) {
    controller.year = this.year;
    controller.people = model.people;
    controller.training = this.modelFor('training');
  }
}
