import Component from '@glimmer/component';
import {action} from '@ember/object';
import {schedule} from '@ember/runloop';
import {cached, tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {htmlSafe} from '@ember/template';
import {TRAINING} from 'clubhouse/constants/positions';
import {isEmpty} from '@ember/utils';
import hyperlinkText from "clubhouse/utils/hyperlink-text";
import {shiftFormat} from "clubhouse/helpers/shift-format";
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
  @tracked signUpSlot;

  @tracked showScheduleBlocker = false;

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
      const schedule = await this.ajax.request(`person/${person_id}/schedule`, {data});

      this.year = year;
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
   * Sign up for a shift. Prevent the page from moving because a new row appeared in the signed up table.
   *
   * @param slot
   */

  @action
  joinSlot(slot) {
    this.shiftManage.slotSignup(slot, this.args.person, (result) => {
      // Record the original row position on the page
      slot.person_assigned = true;
      this.permission = {...this.permission, recommend_burn_weekend_shift: result.recommend_burn_weekend_shift};
      this._sortAndMarkSignups();

      // And reposition the page so things appear not to move when the sign-up is added
      // to the schedule.
      schedule('afterRender',
        async () => {
          if (this.isMe) {
            if (!isEmpty(slot.slot_url)) {
              this.modal.info('Additional Shift Information',
                htmlSafe(`<p class="text-success"><i class="fa-solid fa-check"></i> You are signed up for the shift.</p><p>Here's more information about the shift:</p><p>${hyperlinkText(slot.slot_url)}</p>To view this information again, click on the shift description with the <i class="fa-solid fa-question-circle info-icon"></i> icon.`))
            }

            if (result.is_mvr_eligible) {
              await this.session.loadUser();
              let agreementWarning = '';

              if (!result.signed_motorpool_agreement) {
                agreementWarning = '<p>To operate the smaller fleet vehicles, such as the UTVs and golf carts,' +
                  ' you must first sign the Motor Pool Agreement. Please complete this step to ensure you are authorized' +
                  ' to drive these vehicles during your shift. Visit the Clubhouse homepage and follow the dashboard' +
                  ' instructions to sign the agreement.</p>';
              } else {
                agreementWarning = '<p>Because you have signed the Motor Pool Agreement, you are permitted to operate the smaller vehicles,' +
                  ' such as UTVs and golf carts, during your shift.</p>';
              }

              if (result.is_past_mvr_deadline) {
                this.modal.info('Motor Vehicle Record Request',
                  htmlSafe(`<p>You have successfully signed up for the shift. This position uses
                              vehicles from the Ranger rental fleet.</p>
                              ${agreementWarning}
                             <p>Unfortunately, the deadline of ${shiftFormat([result.mvr_deadline], {})}
                               (Pacific) has passed to submit a Motor Vehicle Record (MVR) request. For future events,
                               we encourage you to sign up for a shift before the MVR submission
                               deadline to expand your vehicle options.</p>`));
              } else {
                this.modal.info('Motor Vehicle Record Request (optional)',
                  htmlSafe(`<p>
                    The shift has been signed up for. The position involes using vehicles from the Ranger rental fleet.
                    </p>
                   ${agreementWarning}
                   <p>This position allows access to the larger rental fleet vehicles if a Motor Vehicle Record (MVR)
                    Request is submitted and approved. This is not the same as signing the Motor Pool Agreement.</p>
                   <p>If you choose not to submit a MVR Request or if the request is denied, you will be limited to
                   operating UTVs and golf carts.</p>
                   <p>To obtain MVR approval, visit the Clubhouse homepage and follow the instructions on the dashboard.
                    A valid driver’s license is required. License and driving record verification can take 2 weeks
                    or more. Longer for non-US license holders. Enter all information carefully, denials most often
                    occur due to errors when submitting the form.
                   </p>
                   <p class="text-danger">
                     The deadline to submit a MVR Request is ${shiftFormat([result.mvr_deadline], {})} (Pacific).
                     No exceptions will be made once the deadline has passed.
                   </p>
                   `));
              }
            }
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
  leaveSlot(slot) {
    let message;

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
          slot.person_assigned = false;
          slot.slot_signed_up = result.signed_up;
          this.permission = {...this.permission, recommend_burn_weekend_shift: result.recommend_burn_weekend_shift};
          this._sortAndMarkSignups();
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
      slot.slot_signed_up = slot.signUpInfo.signed_up;
      slot.slot_max = slot.signUpInfo.max;
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
