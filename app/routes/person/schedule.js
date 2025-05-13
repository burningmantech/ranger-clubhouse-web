import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import {MANAGE} from "clubhouse/constants/roles";

export default class PersonScheduleRoute extends ClubhouseRoute {
  roleRequired = MANAGE;

  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    this.year = requestYear(params);
  }

  setupController(controller) {
    controller.year = this.year;
    controller.person = this.modelFor('person');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.year = null;
    }
  }
}
