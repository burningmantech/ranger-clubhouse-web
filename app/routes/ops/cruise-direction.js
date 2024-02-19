import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN, MANAGE} from "clubhouse/constants/roles";
import requestYear from "clubhouse/utils/request-year";
import RSVP from 'rsvp';

export default class OpsCruiseDirectionRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, MANAGE];

  queryParams = {
    year: {refreshModel: 1}
  };

  model(params) {
    const year = requestYear(params);

    return RSVP.hash({
      year,
      shifts: this.ajax.request('slot/dirt-shift-times', {data: {year}}).then(({shifts}) => shifts),
     });
  }

  setupController(controller, model) {
    controller.year = model.year
    controller.shifts = model.shifts;
    controller.timesheets = model.timesheets;
    controller.selectedShift = null;
    controller.suggestedSlot = controller.shifts.filter((s) => s.has_started && !s.has_ended).slice(-1)[0];
  }
}
