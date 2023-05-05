import Component from '@glimmer/component';
import {action} from '@ember/object';
import {set} from '@ember/object';
import {schedule} from '@ember/runloop';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {htmlSafe} from '@ember/template';
import {TRAINING} from 'clubhouse/constants/positions';

export default class ScheduleManageComponent extends Component {
  @service ajax;
  @service modal;
  @service toast;
  @service house;
  @service session;
  @service shiftManage;

  @tracked scheduleSummary;
  @tracked requirementsOverride = false;
  @tracked showScheduleBlocker = false;
  @tracked permission;

  @tracked availableSlots;
  @tracked isCurrentYear;

  @tracked isShinyPenny;

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

    this.availableSlots = slots.filter((slot) => slot.slot_active);
    this.isCurrentYear = (+year === this.house.currentYear());

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
    this.args.slots.forEach((slot) => {
      slot.is_overlapping = false;
      slot.overlappingSlots = [];
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
          prevSlot.is_training_overlap = true;
        } else {
          slot.is_overlapping = true;
          prevSlot.is_overlapping = true;
          slot.overlappingSlots.push(prevSlot);
          prevSlot.overlappingSlots.push(slot);
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
    const currentOffset = row.getBoundingClientRect().top - window.scrollY;

    this.shiftManage.slotSignup(slot, this.args.person, (result) => {
      // Record the original row position on the page

      this.args.signedUpSlots.pushObject(slot);
      slot.person_assigned = true;
      this.permission = {...this.permission, recommend_burn_weekend_shift: result.recommend_burn_weekend_shift};
      this._sortAndMarkSignups();

      // And reposition the page so things appear not to move when the sign-up is added
      // to the schedule.
      schedule('afterRender',
        () => window.scrollTo(window.scrollX, row.getBoundingClientRect().top - currentOffset)
      );
    });
  }

  /**
   * Remove a sign-up from the schedule. Prevent the page from moving because a row disappeared from the signed up table.
   *
   * @param slot
   * @param {Event} event
   */

  @action
  leaveSlot(slot, event) {
    let message, row = null, currentOffset = 0;

    if (event) {
      row = event.target.closest('.schedule-row');
      currentOffset = row.getBoundingClientRect().top - window.scrollY;
    }

    if (slot.has_started && this.isAdmin) {
      message = 'The shift has already started. Because you are an admin, you are allowed to removed the shift. '
    } else {
      message = '';
    }

    message += `Are you sure you want to remove "${slot.position_title} - ${slot.slot_description}" from the schedule?`;

    this.modal.confirm('Confirm Leaving Shift',
      message,
      async () => {
        set(slot, 'is_submitting', true);
        try {
          const result = await this.ajax.request(`person/${this.args.person.id}/schedule/${slot.id}`, {method: 'DELETE'});
          const signedUp = this.args.signedUpSlots.find((s) => +s.id === +slot.id);

          if (row) {
            // Try to keep the page position static. The sign up will be removed
            // from the schedule, the row deleted, and the browser may want
            // to reposition the page.
            setTimeout(() =>
              schedule('afterRender', () => {
                // The sign-up may have been removed via the scheduled table and the row no longer exists.
                if (document.body.contains(row)) {
                  window.scrollTo(window.scrollX, row.getBoundingClientRect().top - currentOffset);
                }
              }), 100);
          }

          if (signedUp) {
            this.args.signedUpSlots.removeObject(signedUp);
            this._sortAndMarkSignups();
          }

          slot.person_assigned = false;
          slot.slot_signed_up = result.signed_up;
          this.permission = {...this.permission, recommend_burn_weekend_shift: result.recommend_burn_weekend_shift};
          this.toast.success('The shift has been removed from the schedule.');
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          set(slot, 'is_submitting', false)
        }
      }
    );
  }

  /**
   * Show who is signed up for a given slot
   *
   * @param {ScheduleSlotModel} slot
   */

  @action
  async showPeople(slot) {
    slot.is_retrieving_people = true;
    try {
      const result = await this.ajax.request('slot/' + slot.id + '/people');
      let callsigns = result.people.map((person) => person.callsign);
      const signups = callsigns.length;
      if (signups) {
        const list = callsigns.map((c) => `<div>${c}</div>`).join('');
        callsigns = htmlSafe(`<div class="callsign-list">${list}</div>`);
      } else {
        callsigns = "No one is signed up for this shift. Be the first!";
      }
      this.modal.info(`${signups} signup${signups === 1 ? '' : 's'} for ` + slot.slot_description, callsigns);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      set(slot, 'is_retrieving_people', false)
    }
  }
}
