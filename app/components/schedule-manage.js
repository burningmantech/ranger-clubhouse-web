import Component from '@glimmer/component';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {TRAINING} from 'clubhouse/constants/positions';
import {isEmpty} from '@ember/utils';
import ScheduleSlotModel from "clubhouse/records/schedule-slot";

export default class ScheduleManageComponent extends Component {
  @service ajax;
  @service modal;
  @service toast;
  @service house;
  @service session;
  @service shiftManage;

  @tracked scheduleSummary;
  @tracked requirementsOverride = false;
  @tracked permission;
  @tracked creditsEarned;

  @tracked slots;
  @tracked availableSlots;

  @tracked isCurrentYear;
  @tracked year;

  @tracked isShinyPenny;

  @tracked isLoading = false;

  @tracked signUpInfo;

  @tracked showScheduleBlocker = false;

  @tracked showShiftInfo = false;
  @tracked showMVRInfo = false;
  @tracked resultInfo;

  activeOptions = [
    ['Active', 'active'],
    ['Inactive', 'inactive'],
    ['All', 'all'],
  ];

  constructor() {
    super(...arguments);

    this.isMe = (this.session.userId === +this.args.person.id);
    this.isAdmin = this.session.isAdmin;
    this._loadSchedule(this.args.year);
  }

  async _loadSchedule(year) {
    const person_id = this.args.person.id;
    try {
      this.isLoading = true;
      this.isCurrentYear = (+year === this.house.currentYear());

      const data = {
        person_id,
        year,
      }
      if (this.isCurrentYear) {
        data.signup_permission = 1;
      }
      this.year = year;

      const schedule = await this.ajax.request(`person/${person_id}/schedule`, {data});

      this.permission = schedule.signup_permission;
      this.slots = ScheduleSlotModel.hydrate(schedule.slots, schedule.positions);
      this.creditsEarned = schedule.credits_earned;
      this.scheduleSummary = schedule.schedule_summary;
      this.availableSlots = this.slots.filter((slot) => slot.slot_active);
      if (this.isCurrentYear) {
        if (!this.permission.all_signups_allowed) {
          this.showScheduleBlocker = true;
        } else {
          this.showScheduleBlocker = this.hasTrainingBlocker = !this.permission.training_signups_allowed;
        }
      }
      this._sortAndMarkSignups();
    } catch (response) {
      // Likely to see the request aborted to due to a spotty internet connection.
      this.year = year;
      this.permission = {};
      this.slots = [];
      this.creditsEarned = 0.0;
      this.scheduleSummary = {};
      this.availableSlots = [];
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  onYearChange(year) {
    this._loadSchedule(year);
  }

  /**
   * Sort the signed up slots by start time, and mark any slots which overlap with one another.
   *
   * @private
   */

  _sortAndMarkSignups() {
    // Clear out overlapping flags
    this.slots.forEach((slot) => {
      slot.isOverlapping = false;
      slot.overlappingSlots = [];
      slot.hasTrainingOverlap = false;
    });

    let prevEndTime = 0, prevSlot = null;

    this.signedUpSlots.forEach(function (slot) {
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

  @cached
  get signedUpSlots() {
    const slots = this.slots.filter((slot) => slot.person_assigned);
    slots.sort((a, b) => a.slot_begins_time - b.slot_begins_time);

    return slots;
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
   * Sign up for a shift.
   *
   * @param slot
   */

  @action
  joinSlot(slot) {
    this.shiftManage.slotSignup(slot, this.args.person,
      (result) => this.joinSlotSuccess(slot, result),
      false,
      (slot, result) => this.signupError(slot, result));
  }

  /**
   * Called when the signup was successful.
   *
   * @param slot
   * @param result
   */

  async joinSlotSuccess(slot, result) {
    // Record the original row position on the page
    slot.person_assigned = true;
    this.permission = {...this.permission, recommend_burn_weekend_shift: result.recommend_burn_weekend_shift};
    if (result.linked_slots) {
      this._updateLinkedSlots(result.linked_slots);
    }
    this._sortAndMarkSignups();

    if (this.isMe) {
      result.slot = slot;

      const positions = result.linked_slots?.map(linked => linked.position_title);

      this.resultInfo = result;
      if (!isEmpty(slot.slot_url) || (result.became_full && positions?.length)) {
        result.linkedPositions = positions;
        this.showShiftInfo = true;
      }

      if (result.is_mvr_eligible) {
        // Pickup the MVR flags so the Vehicle link appears for the user.
        await this.session.loadUser();
        if (!result.signed_motorpool_agreement) {
          result.agreementWarning = 'To operate the smaller fleet vehicles, such as the UTVs and golf carts,' +
            ' you must first sign the Motor Pool Agreement. Please complete this step to ensure you are authorized' +
            ' to drive these vehicles during your shift. Visit the Clubhouse homepage and follow the dashboard' +
            ' instructions to sign the agreement.';
        } else {
          result.agreementWarning = 'Because you have signed the Motor Pool Agreement,' +
            ' you are permitted to operate the smaller vehicles,' +
            ' such as UTVs and golf carts, during your shift.';
        }
        this.showMVRInfo = true;
       }
    }
  }

  /**
   * Called when the signup failed - the Shift Manager will handle showing the error to the user.
   * Ensure the slot(s) counts are updated.
   *
   * @param slot
   * @param result
   */

  signupError(slot, result) {
    // check for the key and not use 'result.signed_up' in case the signup count is zero.
    if ('signed_up' in result) {
      slot.slot_signed_up = result.signed_up;
    }

    if (result.linked_slots) {
      this._updateLinkedSlots(result.linked_slots);
    }

    this._sortAndMarkSignups();
  }

  @action
  closeShiftInfo() {
    this.showShiftInfo = false;
  }

  @action
  closeMVRInfo() {
    this.showMVRInfo = false;
  }

  /**
   * Remove a sign-up from the schedule. Prevent the page from moving because a row disappeared from the signed up table.
   *
   * @param slot
   * @param {Event} event
   */

  @action
  leaveSlot(slot) {
    let message;

    if (slot.has_started && this.isAdmin) {
      message = `<p class="text-danger">
      The shift has ${slot.has_ended ? 'ended' : 'already started'}.
      As an admin, you can remove the shift, but it’s not recommended—doing so will delete historical
       data and cause inaccuracies in reports.
       </p>`
    } else {
      message = '';
    }

    message += `Are you sure you want to remove "${slot.position_title} - ${slot.slot_description}" from the schedule?`;

    this.modal.confirm('Confirm Leaving Shift', message, () => this._performSignUpRemoval(slot));
  }

  async _performSignUpRemoval(slot) {
    slot.isSubmitting = true;
    try {
      const result = await this.ajax.request(`person/${this.args.person.id}/schedule/${slot.id}`, {method: 'DELETE'});

      if (result.linked_slots) {
        this._updateLinkedSlots(result.linked_slots);
      }
      slot.slot_signed_up = result.signed_up;

      switch (result.status) {
        case 'success':
          break; // Everything a-okay.
        case 'missing-signup':
          this._missingSignupDialog();
          return;
        case 'has-started':
          this._hasStartedDialog();
          return;
        case 'has-ended':
          this._hasEndedDialog();
          return;
        case 'slot-not-found':
          this._missingSlotDialog();
          return;

      }
      slot.person_assigned = false;
      this.permission = {...this.permission, recommend_burn_weekend_shift: result.recommend_burn_weekend_shift};
      this._sortAndMarkSignups();
      this.toast.success('The shift has been removed from the schedule.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      slot.isSubmitting = false;
    }
  }

  _missingSignupDialog() {
    this.modal.info('Missing Signup',
      'The shift has already been removed from the schedule. Please refresh the page to ensure you’re seeing the most up-to-date schedule.'
    );
  }

  _hasStartedDialog() {
    this.modal.info('Shift Has Started', 'The shift has started and cannot be removed from the schedule.');
  }

  _hasEndedDialog() {
    this.modal.info('Shift Has Ended', 'The shift has ended and cannot be removed the from the schedule.');
  }

  _missingSlotDialog() {
    this.modal.info('Shift Deleted', 'It looks like the shift has been deleted. Please refresh the page to ensure you’re seeing the most up-to-date schedule.');
  }


  _updateLinkedSlots(slots) {
    slots.forEach((linked) => {
      const found = this.slots.find((s) => s.id === linked.slot_id)
      if (found) {
        found.slot_signed_up = linked.signed_up;
      }
    });
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
      slot.slot_signed_up = slot.signUpInfo.signed_up;
      slot.slot_max = slot.signUpInfo.max;
      if (slot.signUpInfo.parent) {
        this._updateLinkedSlots([slot.signUpInfo.parent]);
      }
      if (slot.signUpInfo.child) {
        this._updateLinkedSlots([slot.signUpInfo.child]);
      }
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
