import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import _ from 'lodash';
import {
  ALLOWED_TO_WORK,
  DECEASED,
  DISMISSED,
  STATUS_OPTIONS,
  SUSPENDED,
  UBERBONKED
} from "clubhouse/constants/person_status";
import Selectable from "clubhouse/utils/selectable";

const EXCLUDED_STATUSES = [
  DECEASED,
  DISMISSED,
  SUSPENDED,
  UBERBONKED,
]
export default class PeopleByPositionRoute extends ClubhouseRoute {
  queryParams = {
    onPlaya: {refreshModel: true}
  };

  model(params) {
    return this.ajax.request('position/people-by-position', {data: {onPlaya: params.onPlaya ? 1 : 0}});
  }

  setupController(controller, model) {
    controller.positions = model.positions;
    controller.positionsScrollList = model.positions.map((p) => ({id: `position-${p.id}`, title: p.title}))
    controller.people = _.keyBy(model.people, 'id');
    controller.statuses = STATUS_OPTIONS.filter((status) => !EXCLUDED_STATUSES.includes(status))
      .map((status) => new Selectable({name: status}, ALLOWED_TO_WORK.includes(status))
      );
  }
}
