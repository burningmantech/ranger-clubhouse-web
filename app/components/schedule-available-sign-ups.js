import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import dayjs from 'dayjs';

const allDays = ['All Days', 'all'];
const upcomingShifts = ['Upcoming Shifts', 'upcoming'];

export default class AvailableShiftSignUpsComponent extends Component {
  @service house;

  @tracked filterDay = 'upcoming';

  constructor() {
    super(...arguments);
    if (!this.isCurrentYear) {
      this.filterDay = 'all';
    }
    this.isCurrentYear = (+this.args.year === this.house.currentYear());
  }

  /**
   * Build and return the slots to view. Filtering is done on days and/or active.
   *
   * @returns {[]}
   */

  get viewSlots() {
    let slots = this.args.availableSlots;
    const filterDay = this.filterDay;

    if (filterDay) {
      if (filterDay === 'upcoming') {
        slots = slots.filter((slot) => !slot.has_started);
      } else if (filterDay !== 'all') {
        slots = slots.filter((slot) => slot.slotDay === filterDay);
      }
    }

    return slots;
  }

  /**
   * Return day filter options based on what slots are available to sign up for.
   *
   * @returns {*[]}
   */

  get dayOptions() {
    const unique = this.args.availableSlots.uniqBy('slotDay').mapBy('slotDay');
    const days = [];

    unique.sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    if (this.isCurrentYear) {
      days.push(upcomingShifts);
    }

    days.push(allDays);

    unique.forEach(day => {
      days.push([dayjs(day).format('ddd MMM DD'), day])
    });

    return days;
  }


  /**
   * Return a position list based on what slots are being viewed.
   *
   * @returns {[]}
   */

  get positions() {
    const slots = this.viewSlots;
    const groups = {};

    slots.forEach((slot) => {
      const position_id = slot.position_id;
      const group = groups[position_id];

      if (group) {
        group.slots.push(slot);
      } else {
        groups[position_id] = {title: slot.position_title, type: slot.position_type, position_id, slots: [slot]};
      }
    });

    return Object.values(groups).sort((a, b) => a.title.localeCompare(b.title));
  }
}
