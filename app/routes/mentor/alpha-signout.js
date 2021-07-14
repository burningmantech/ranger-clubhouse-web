import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ALPHA } from 'clubhouse/constants/positions';
import dayjs from 'dayjs';

export default class MentorAlphaSignoutRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('slot', { data: { position_id: ALPHA, year: this.house.currentYear() }});
  }

  setupController(controller, model) {
    const year = this.house.currentYear();
    const slotOptions = model.slot.map((s) => ([
      dayjs(s.begins).format('ddd MMM DD [@] HH:mm'), s.begins
    ]));
    slotOptions.unshift([ 'Select Shift', '']);
    slotOptions.push([ `All Alphas on shift`, 'all']);

    controller.set('selectedSlot', '');
    controller.set('slotOptions',slotOptions);
    controller.set('slots', model.slot);
    controller.set('year', year);
  }
}
