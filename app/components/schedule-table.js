import Component from '@glimmer/component';
import {cached, tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {action} from '@ember/object';
import dayjs from 'dayjs';

export default class ScheduleTableComponent extends Component {
  @service house;
  @service modal;
  @tracked showAllShifts = true;
  @tracked showCalendarExportAdvisory = false;

  constructor() {
    super(...arguments);
    this.isCurrentYear = (+this.args.year === this.house.currentYear());
    if (this.isCurrentYear) {
      this.showAllShifts = false;
    }
  }

  /**
   * Show all the slots
   */

  @action
  toggleAll() {
    this.showAllShifts = !this.showAllShifts;
  }

  /**
   * Filter the slots for viewing.
   *
   * @returns {[]}
   */

  get viewSlots() {
    const {slots} = this.args;

    return this.showAllShifts ? slots : this.upcomingSlots;
  }

  @cached
  get upcomingSlots() {
    return this.args.slots.filter((slot) => !slot.has_started);
  }

  /**
   * Are there overlapping sign-ups?
   *
   * @returns {boolean}
   */

  get hasOverlapping() {
    return !!this.viewSlots.find((slot) => slot.isOverlapping);
  }

  /**
   * How many previous slots are there?
   *
   * @returns {number}
   */

  @cached
  get previousSlotCount() {
    return this.args.slots.length - this.upcomingSlots.length;
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

    this.showCalendarExportAdvisory = true;
  }

  @action
  async calendarExportConfirmed() {
    const {slots} = this.args;
    let ical;
    try {
      ical = (await import('ical-generator')).default;
    } catch (response) {
      this.house.handleErrorResponse(response);
      return;
    }

    const calendar = ical({
      name: `${this.args.year} BRC Ranger Schedule`,
    });
    calendar.prodId({
      company: 'Burning Man Project',
      product: 'Ranger Clubhouse',
      language: 'EN',
    });

    slots.forEach((slot) => {
      calendar.createEvent({
        start: dayjs.tz(slot.slot_begins, slot.slot_tz),
        end: dayjs.tz(slot.slot_ends, slot.slot_tz),
        summary: slot.position_title,
        detail: `${slot.description} ${slot.url}`,
        timezone: slot.slot_tz,
      });
    });

    this.showCalendarExportAdvisory = false;
    this.house.downloadFile(`${this.args.year}-ranger-schedule.ics`, calendar.toString(), 'text/calendar');
  }

  @action
  cancelCalendarExport() {
    this.showCalendarExportAdvisory = false;
  }
}
