import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ALPHA} from "clubhouse/constants/positions";


export default class MentorShiftReportRoute extends ClubhouseRoute {
  queryParams = {
    slot_id: { refreshModel: true},
    year: { refreshModel: true},
    on_duty: { refreshModel: true},
  };

  async model({slot_id, year, on_duty}) {
    const reportQuery = {};
    let report = null;
    on_duty = !!on_duty;
    if (slot_id || on_duty) {
      if (on_duty) {
        reportQuery.on_duty = 1;
      } else {
        reportQuery.slot_id = slot_id;
      }
      report = await this.ajax.request('mentor/shift-report', {data: reportQuery});
    }

    if (!year) {
      year = this.session.currentYear();
    }

    return {
      report,
      slots: (await this.ajax.request('slot', {data: {position_id: ALPHA, year, active: 1}})).slot
    };
  }

  setupController(controller, {report, slots}) {
    controller.report = report;
    controller.slots = slots;
  }
}
