import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, TRAINER} from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';
import {TRAINING} from "clubhouse/constants/positions";

export default class TrainingOnlineCourseProgressRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, TRAINER];

  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('online-course/progress', {data: {year, position_id: TRAINING}});
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    controller.set('people', model.people);
  }
}
