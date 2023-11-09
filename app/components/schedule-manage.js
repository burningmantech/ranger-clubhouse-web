import Component from '@glimmer/component';
import {action} from '@ember/object';
import {schedule} from '@ember/runloop';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {htmlSafe} from '@ember/template';
import {TRAINING} from 'clubhouse/constants/positions';
import {isEmpty} from '@ember/utils';
import hyperlinkText from "clubhouse/utils/hyperlink-text";

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

  @tracked signUpInfo;
  @tracked signUpSlot;

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
      slot.isOverlapping = false;
      slot.overlappingSlots = [];
      slot.hasTrainingOverlap = false;
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
          slot.hasTrainingOverlap = true;
          prevSlot.hasTrainingOverlap = true;
        } else {
          slot.isOverlapping = true;
          prevSlot.isOverlapping = true;
          slot.overlappingSlots.push(prevSlot);
          prevSlot.overlappingSlots.push(slot);
        }
      } else {
        slot.isOverlapping = false
        slot.hasTrainingOverlap = false;
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
        () => {
          window.scrollTo(window.scrollX, row.getBoundingClientRect().top - currentOffset);
          if (this.isMe && !isEmpty(slot.slot_url)) {
            this.modal.info('Additional Shift Information',
              htmlSafe(`<p class="text-success"><i class="fa-solid fa-check"></i> You are signed up for the shift.</p><p>Here's more information about the shift:</p><p>${hyperlinkText(slot.slot_url)}</p>To view this information again, click on the shift description with the <i class="fa-solid fa-question-circle info-icon"></i> icon.`))
          }
        }
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
      slot.isSubmitting = true;
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
          slot.isSubmitting = false;
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
    slot.isRetrievingSignUps = true;
    try {
      slot.signUpInfo = await this.ajax.request(`slot/${slot.id}/people`);
     } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      slot.isRetrievingSignUps = false
    }
  }

  @action
  hidePeople(slot) {
    slot.signUpInfo = null;
  }
}
