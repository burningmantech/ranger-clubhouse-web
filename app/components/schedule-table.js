import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {action} from '@ember/object';
import ical from 'ical-generator';
import dayjs from 'dayjs';

export default class ScheduleTableComponent extends Component {
  @service house;
  @service modal;
  @tracked viewSchedule;

  constructor() {
    super(...arguments);
    this.isCurrentYear = (this.args.year == this.house.currentYear());
    this.viewSchedule = this.isCurrentYear ? 'upcoming' : 'all';
  }

  /**
   * Show all the slots
   */

  @action
  showAllAction() {
    this.viewSchedule = 'all';
  }

  /**
   * Show the upcoming slots
   */

  @action
  showUpcomingAction() {
    this.viewSchedule = 'upcoming';
  }

  /**
   * Filter the slots for viewing.
   *
   * @returns {[]}
   */

  get viewSlots() {
    const slots = this.args.slots;

    if (this.viewSchedule !== 'upcoming') {
      return slots;
    }

    return slots.filter((slot) => !slot.has_started);
  }

  /**
   * How many upcoming shifts (i.e., ones not started yet) are there?
   *
   * @returns {Number}
   */

  get upcomingCount() {
    return this.args.slots.reduce((upcoming, slot) => (slot.has_started ? 0 : 1) + upcoming, 0);
  }

  /**
   * Are there overlapping sign-ups?
   *
   * @returns {boolean}
   */

  get hasOverlapping() {
    return this.viewSlots.reduce((total, slot) => (slot.is_overlapping ? 1 : 0) + total, 0) > 0;
  }

  /**
   * Export the person's schedule to a ICS file.
   */

  @action
  exportCalendarAction() {
    const {slots} = this.args;
    if (!slots.length) {
      this.modal.info('No Sign-Ups', "No shifts and/or training sessions are signed up for. There's nothing to export.")
      return;
    }

    const calendar = ical({name: 'BRC Ranger Schedule'});
    calendar.prodId({
      company: 'Burning Man Project',
      product: 'Ranger Clubhouse',
      language: 'EN'
    });

    slots.forEach((slot) => {
      calendar.createEvent({
        start: dayjs.tz(slot.slot_begins, slot.slot_tz).format(),
        end: dayjs.tz(slot.slot_ends, slot.slot_tz).format(),
        summary: slot.position_title,
        detail: `${slot.description} ${slot.url}`,
      });
    });

    this.house.downloadFile(`${this.args.year}-ranger-schedule.ics`, calendar.toString(), 'text/calendar');
  }
}
