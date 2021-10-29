import Component from '@glimmer/component';
import {action} from '@ember/object';
import {set} from '@ember/object';
import {Role} from 'clubhouse/constants/roles';
import dayjs from 'dayjs';
import {schedule} from '@ember/runloop';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import {htmlSafe} from '@ember/template';
import {TRAINING} from 'clubhouse/constants/positions';

const allDays = ['All Days', 'all'];
const upcomingShifts = ['Upcoming Shifts', 'upcoming'];

export default class ScheduleManageComponent extends Component {
  @service ajax;
  @service modal;
  @service toast;
  @service house;
  @service session;
  @service shiftManage;

  @tracked filterDay = 'upcoming';
  @tracked filterActive = 'active';
  @tracked scheduleSummary;
  @tracked requirementsOverride = false;
  @tracked showScheduleBlocker = false;
  @tracked permission;

  @tracked availableSlots;
  @tracked isCurrentYear;

  activeOptions = [
    ['Active', 'active'],
    ['Inactive', 'inactive'],
    ['All', 'all'],
  ];

  constructor() {
    super(...arguments);

    const {person, permission, year, slots, signedUpSlots} = this.args;

    this.scheduleSummary = this.args.scheduleSummary;
    this._sortAndMarkSignups();

    signedUpSlots.forEach((signedUp) => {
      const slot = slots.find((slot) => signedUp.id === slot.id);
      if (slot) {
        slot.person_assigned = true;
      }
    });

    /*
     * Filter out what the person can actual see based on their roles.
     * TODO Revisit whether everyone should be able to see inactive slots if they choose.
     */

    if (this.session.hasRole(
      [Role.ADMIN, Role.EDIT_SLOTS, Role.GRANT_POSITION, Role.VC, Role.TRAINER, Role.ART_TRAINER])) {
      this.availableSlots = slots;
    } else {
      this.availableSlots = slots.filter((slot) => slot.slot_active);
    }

    this.inactiveSlots = this.availableSlots.filter((slot) => !slot.slot_active);
    this.isCurrentYear = (+year === this.house.currentYear());
    if (!this.isCurrentYear) {
      this.filterDay = 'all';
    }
    this.isMe = (this.session.userId === +person.id);
    this.isAdmin = this.session.isAdmin;

    if (this.isCurrentYear) {
      if (!permission.all_signups_allowed) {
        this.showScheduleBlocker = true;
      } else {
        this.showScheduleBlocker = this.hasTrainingBlocker = !permission.training_signups_allowed;
      }
    }

    this.permission = permission;

    const photoStatus = permission.photo_status;
    this.hasApprovedPhoto = (photoStatus === 'approved' || photoStatus === 'not-required')
  }

  /**
   * Build and return the slots to view. Filtering is done on days and/or active.
   *
   * @returns {[]}
   */

  get viewSlots() {
    let slots = this.availableSlots;
    const filterDay = this.filterDay;

    if (filterDay) {
      if (filterDay === 'upcoming') {
        slots = slots.filter((slot) => !slot.has_started);
      } else if (filterDay !== 'all') {
        slots = slots.filter((slot) => slot.slotDay === filterDay);
      }
    }

    if (this.filterActive !== 'all') {
      const isActive = (this.filterActive === 'active');
      slots = slots.filter((slot) => slot.slot_active == isActive);
    }

    return slots;
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
        groups[position_id] = {title: slot.position_title, position_id, slots: [slot]};
      }
    });

    return Object.values(groups).sort((a, b) => a.title.localeCompare(b.title));
  }

  /**
   * Return day filter options based on what slots are available to sign up for.
   *
   * @returns {*[]}
   */

  get dayOptions() {
    const unique = this.availableSlots.uniqBy('slotDay').mapBy('slotDay');
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

    unique.forEach(function (day) {
      days.push([dayjs(day).format('ddd MMM DD'), day])
    });

    return days;
  }

  /**
   * Sort the signed up slots by start time, and mark any slots which overlap with one another.
   *
   * @private
   */

  _sortAndMarkSignups() {
    const slots = this.args.signedUpSlots;

    slots.sort((a, b) => a.slot_begins_time - b.slot_begins_time);
    // Clear out overlapping flags
    slots.forEach((slot) => {
      slot.is_overlapping = false;
      slot.is_training_overlap = false;
    });

    let prevEndTime = 0, prevSlot = null;

    slots.forEach(function (slot) {
      if (slot.slot_begins_time < prevEndTime) {
        if (slot.isTraining && prevSlot.isTraining
          && (
            (slot.position_id === TRAINING && prevSlot.position_id !== TRAINING)
            || (slot.position_id !== TRAINING && prevSlot.position_id === TRAINING)
          )
        ) {
          // Might be dirt training and ART training.. which is okay. Common scenario is attending Green Dot
          // training in the morning and then Dirt Training in the afternoon. However, most Dirt Trainings are
          // scheduled to start in the morning even tho veterans only have to attend the afternoon portion.
          slot.is_training_overlap = true;
          prevSlot.is_training_overlap =  true;
        } else {
          slot.is_overlapping = true;
          prevSlot.is_overlapping = true;
        }
      } else {
        slot.is_overlapping = false
        slot.is_training_overlap = false;
      }
      prevEndTime = slot.slot_ends_time;
      prevSlot = slot;
    });
  }

  /**
   * Update the schedule summary after adding or remove signups.
   *
   * @private
   */

  _retrieveScheduleSummary() {
    this.ajax.request(`person/${this.args.person.id}/schedule/summary`, {data: {year: this.args.year}})
      .then((result) => this.scheduleSummary = result.summary)
      .catch((result) => this.house.handleErrorResponse(result));
  }

  /**
   * Override the scheduling sign up blockers
   *
   */

  @action
  overrideAction() {
    if (!this.hasTrainingBlocker) {
      this.requirementsOverride = true;
    }
    this.showScheduleBlocker = false;
  }

  /**
   * Sign up for a shift. Prevent the page from moving because a new row appeared in the signed up table.
   *
   * @param slot
   * @param {Event} event
   */

  @action
  joinSlot(slot, event) {
    const row = event.target.closest('.schedule-row');
    const currentOffset = row.getBoundingClientRect().top - window.pageYOffset;

    this.shiftManage.slotSignup(slot, this.args.person, (result) => {
      // Record the original row position on the page

      this.args.signedUpSlots.pushObject(slot);
      slot.person_assigned = true;
      this.permission = {...this.permission, recommend_burn_weekend_shift: result.recommend_burn_weekend_shift};
      this._sortAndMarkSignups();
      this._retrieveScheduleSummary();

      // And reposition the page so things appear not to move when the sign up is added
      // to the schedule.
      schedule('afterRender',
        () => window.scrollTo(window.pageXOffset, row.getBoundingClientRect().top - currentOffset)
      );
    });
  }

  /**
   * Remove a sign up from the schedule. Prevent the page from moving because a row disappeared from the signed up table.
   *
   * @param slot
   * @param {Event} event
   */

  @action
  leaveSlot(slot, event) {
    let message, row = null, currentOffset = 0;

    if (event) {
      row = event.target.closest('.schedule-row');
      currentOffset = row.getBoundingClientRect().top - window.pageYOffset;
    }

    if (slot.has_started && this.isAdmin) {
      message = 'The shift has already started. Because you are an admin, you are allowed to removed the shift. '
    } else {
      message = '';
    }

    message += `Are you sure you want to remove "${slot.position_title} - ${slot.slot_description}" from the schedule?`;

    this.modal.confirm('Confirm Leaving Shift',
      message,
      () => {
        set(slot, 'is_submitting', true);
        this.ajax.request(`person/${this.args.person.id}/schedule/${slot.id}`, {method: 'DELETE',})
          .then((result) => {
            const signedUp = this.args.signedUpSlots.find((s) => +s.id === +slot.id);

            if (row) {
              // Try to keep the page position static. The sign up will be removed
              // from the schedule, the row deleted, and the browser may want
              // to reposition the page.
              schedule('afterRender', () => {
                // The sign up may have been removed via the scheduled table and the row no longer exists.
                if (document.body.contains(row)) {
                  window.scrollTo(window.pageXOffset, row.getBoundingClientRect().top - currentOffset);
                }
              });
            }

            if (signedUp) {
              this.args.signedUpSlots.removeObject(signedUp);
              this._sortAndMarkSignups();
            }

            slot.person_assigned = false;
            slot.slot_signed_up = result.signed_up;
            set(this.permission, 'recommend_burn_weekend_shift', result.recommend_burn_weekend_shift);
            this._retrieveScheduleSummary();
            this.toast.success('The shift has been removed from the schedule.');
          }).catch((response) => this.house.handleErrorResponse(response))
          .finally(() => set(slot, 'is_submitting', false));
      }
    );
  }

  /**
   * Show who is signed up for a given slot
   *
   * @param slot
   */

  @action
  showPeople(slot) {
    set(slot, 'is_retrieving_people', true);
    this.ajax.request('slot/' + slot.id + '/people').then((result) => {
      let callsigns = result.people.map((person) => person.callsign);
      const signups = callsigns.length;
      if (signups) {
        const list = callsigns.map((c) => `<div>${c}</div>`).join('');
        callsigns = htmlSafe(`<div class="callsign-list">${list}</div>`);
      } else {
        callsigns = "No one is signed up for this shift. Be the first!";
      }
      this.modal.info(`${signups} signup${signups === 1 ? '' : 's'} for ` + slot.slot_description, callsigns);
    })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => set(slot, 'is_retrieving_people', false));
  }
}
