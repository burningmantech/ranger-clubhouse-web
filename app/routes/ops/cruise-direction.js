import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN, POD_MANAGEMENT} from "clubhouse/constants/roles";
import requestYear from "clubhouse/utils/request-year";
import RSVP from 'rsvp';

export default class OpsCruiseDirectionRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, POD_MANAGEMENT];

  queryParams = {
    year: {refreshModel: 1}
  };

  model(params) {
    const year = requestYear(params);

    return RSVP.hash({
      year,
      shifts: this.ajax.request('slot/dirt-shift-times', {data: {year}}).then(({shifts}) => shifts),
      positions: this.ajax.request('position', {data: {cruise_direction: 1, active: 1}}).then(({position}) => position),
    });
  }

  async setupController(controller, model) {
    const {positions} = model;
    positions.sort((a, b) => a.title.localeCompare(b.title));
    controller.year = model.year
    controller.shifts = model.shifts;
    controller.timesheets = model.timesheets;
    controller.selectedShift = null;
    controller.suggestedSlot = controller.shifts.filter((s) => s.has_started && !s.has_ended).slice(-1)[0];
    controller.positions = positions;
    controller.positionIds = positions.map((p) => +p.id);

    if (controller.suggestedSlot) {
      controller.selectedShift = controller.suggestedSlot;
      await controller._loadSelectedShift();
    }
  }
}
