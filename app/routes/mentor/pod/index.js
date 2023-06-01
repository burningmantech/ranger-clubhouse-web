import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {MENTOR as MENTOR_ROLE} from "clubhouse/constants/roles";
import requestYear from "clubhouse/utils/request-year";
import {ALPHA} from "clubhouse/constants/positions";

export default class MentorPodIndexRoute extends ClubhouseRoute {
  roleRequired = MENTOR_ROLE;
  queryParams = {
    year: {refreshModel: true}
  };

  async model(params) {
    const year = requestYear(params);

    const {slot} = await this.ajax.request('slot', {data: {year, position_id: ALPHA}});

    return {year, slot};
  }

  setupController(controller, model) {
    controller.set('slots', model.slot);
    controller.set('year', model.year);
  }
}
