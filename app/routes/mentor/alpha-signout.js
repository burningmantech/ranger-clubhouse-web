import Route from '@ember/routing/route';
import { ALPHA } from 'clubhouse/constants/positions';
import moment from 'moment';

export default class MentorAlphaSignoutRoute extends Route {
  model() {
    return this.ajax.request('slot', { data: { position_id: ALPHA, year: this.house.currentYear() }});
  }

  setupController(controller, model) {
    const year = this.house.currentYear();
    const slotOptions = model.slot.map((s) => ([
      moment(s.begins).format('ddd MMM DD [@] HH:mm'), s.begins
    ]));
    slotOptions.unshift([ 'Select Shift', '']);
    slotOptions.push([ `All Alphas on shift`, 'all']);

    controller.set('selectedSlot', '');
    controller.set('slotOptions',slotOptions);
    controller.set('slots', model.slot);
    controller.set('year', year);
  }
}
