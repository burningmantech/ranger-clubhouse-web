import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import requestYear from "clubhouse/utils/request-year";
import {TYPE_TRAINING} from "clubhouse/models/position";

export default class AdminOnlineCourseRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  }

  async model(params) {
    const year = requestYear(params);

    return {
      onlineCourses: await this.store.query('online-course', { year }),
      positions: (await  this.ajax.request('position', { data: { type: TYPE_TRAINING }})).position.filter((p) => p.title.match(/training/i)),
      year
    };
  }

  setupController(controller, model) {
    controller.setProperties(model);
    controller.positionOptions =  model.positions.map((p) => [ p.title, p.id ]);
    controller.haveEnrollment = false;
    controller.haveCourseList = false;
  }
}
