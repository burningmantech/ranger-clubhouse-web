import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN, MANAGE} from "clubhouse/constants/roles";
import requestYear from "clubhouse/utils/request-year";
import RSVP from 'rsvp';
import {DIRT, DIRT_GREEN_DOT, DIRT_POST_EVENT, DIRT_PRE_EVENT, DIRT_SHINY_PENNY} from "clubhouse/constants/positions";

export default class ReportsCruiseDirectionRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, MANAGE];

  queryParams = {
    year: {refreshModel: 1}
  };

  model(params) {
    const year = requestYear(params);

    return RSVP.hash({
      year,
      shifts: this.ajax.request('slot/dirt-shift-times', {data: {year}}).then(({shifts}) => shifts),
      timesheets: this.ajax.request('timesheet', {
        data: {
          is_on_duty: 1,
          position_ids: [DIRT, DIRT_PRE_EVENT, DIRT_POST_EVENT, DIRT_SHINY_PENNY, DIRT_GREEN_DOT],
          include_photo: 1
        }
      }).then(({timesheet}) => timesheet)
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
