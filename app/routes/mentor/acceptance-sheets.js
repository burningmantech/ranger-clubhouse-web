import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ALPHA} from "clubhouse/constants/positions";
import Selectable from "clubhouse/utils/selectable";
import dayjs from "dayjs";


export default class MentorAcceptanceSheetsRoute extends ClubhouseRoute {
  async model() {
    return {
      alphas: await this.ajax.request('mentor/alphas').then((result) => result.alphas),
      slots: await this.ajax.request('slot', {
        data: {
          position_id: ALPHA,
          year: this.house.currentYear(),
          active: true
        }
      }).then((result) => result.slot)
    }
  }

  setupController(controller, {alphas, slots}) {
    alphas.forEach((a) => a.selected = true);
    controller.alphas =  alphas.map((a) => new Selectable(a));
    controller.filter ='all';
    controller.selectAll = true;
    controller.year =  this.house.currentYear();
    controller.isPrinting = false;
    controller._buildViewAlphas();

    const options = slots.map((date) => [dayjs(date.begins).format('ddd MMM DD [@] HH:mm'), date.begins]);

    options.unshift(['No Mentor Shift', 'no-signup']);
    options.unshift(['All', 'all']);

    controller.filterOptions = options;

  }
}
