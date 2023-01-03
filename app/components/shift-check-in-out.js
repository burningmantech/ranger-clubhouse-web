import Component from '@glimmer/component';
import {set} from '@ember/object';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {DIRT, DIRT_SHINY_PENNY, TRAINING, BURN_PERIMETER} from 'clubhouse/constants/positions';
import {tracked} from '@glimmer/tracking';
import {NON_RANGER} from 'clubhouse/constants/person_status';
import {ADMIN, TIMESHEET_MANAGEMENT} from 'clubhouse/constants/roles';

export default class ShiftCheckInOutComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service store;
  @service toast;
  @service session;

  @tracked signinPositionId = null;
  @tracked isSubmitting = false;
  @tracked isReloadingTimesheets = false;

  @tracked otOnly = false;

  @tracked showPositionDialog = false;
  @tracked changePositionError = null;

  @tracked showEarlyShiftConfirm = false;
  @tracked earlySlot = null;

  @tracked showForceStartConfirm = false;
  @tracked forcePosition = null;

  constructor() {
    super(...arguments);

    this.activePositions = this.args.positions.filter(position => position.active);

    // Mark imminent slots as trained or not.
    const slots = this.args.imminentSlots;
    if (slots) {
      slots.forEach((slot) => {
        const slotPid = +slot.position_id;
        const position = this.activePositions.find((p) => slotPid === +p.id);
        if (position) {
          if (position.is_untrained) {
            set(slot, 'is_untrained', true);
          }

          if (position.is_unqualified) {
            set(slot, 'is_unqualified', true);
            set(slot, 'unqualified_reason', position.unqualified_reason);
            set(slot, 'unqualified_message', position.unqualified_message);
          }
        }
      });
    }

    const signins = this.activePositions.map((pos) => {
      let title = pos.title;
      let disqualified = null;

      if (pos.is_untrained) {
        disqualified = 'UNTRAINED';
      } else if (pos.is_unqualified) {
        disqualified = pos.unqualified_message;
      }

      if (disqualified) {
        title = `${title} (${disqualified})`;
      }

      return {id: pos.id, title};
    });

    // hack for operator convenience - Dirt is the most common
    // shift, so put that at top.

    const dirt = signins.find((p) => p.id === DIRT);
    if (dirt) {
      signins.removeObject(dirt);
      signins.unshift(dirt);
    }

    // .. and Shiny Penny shift should also be on top
    const sp = signins.find((p) => p.id === DIRT_SHINY_PENNY);
    if (sp) {
      signins.removeObject(sp);
      signins.unshift(sp);
    }

    this.signinPositions = signins;

    // Set the position options to the first item
    this.signinPositionId = this.signinPositions.length ? this.signinPositions.firstObject.id : null;

    // Has the person gone through dirt training?
    if (this.args.person.status === NON_RANGER) {
      this.isPersonDirtTrained = true;
    } else {
      const {eventInfo} = this.args;
      if (eventInfo.online_training_only) {
        this.otOnly = true;
        this.isPersonDirtTrained = eventInfo.online_training_passed;
      } else {
        this.isPersonDirtTrained = !!eventInfo.trainings.find((training) => (training.position_id === TRAINING && training.status === 'pass'));
      }
    }

    this.userCanForceCheckIn = this.session.hasRole([ADMIN, TIMESHEET_MANAGEMENT]);
  }

  /**
   * Does the person actually need a radio?
   *
   * @returns {boolean}
   */

  get mayNotNeedRadio() {
    return this.args.onDutyEntry?.position_id === BURN_PERIMETER;
  }

  /**
   * Start a shift, check to see if the position can be started and if not, confirm a force start.
   *
   * @param {number} positionId
   * @param {number} slotId
   * @private
   */

  _startShift(positionId, slotId = null) {
    const position = this.activePositions.find((p) => +p.id === +positionId);

    if (position.type === 'Training'
      || (this.isPersonDirtTrained && !position.is_unqualified && !position.is_untrained)) {
      this._signInPerson(position, slotId);
      return;
    }

    this.forcePosition = position;
    this.forceSlotId = slotId;
    this.showForceStartConfirm = true;
  }

  /**
   * User confirmed yes, they do want to start the shift.
   */

  @action
  confirmForceStart() {
    this.showForceStartConfirm = false;
    this._signInPerson(this.forcePosition, this.forceSlotId);
  }

  /**
   * Cancel the forced shift start confirmation.
   */

  @action
  closeForceStartConfirm() {
    this.showForceStartConfirm = false;
    this.forcePosition = null;
    this.forceSlotId = null;
  }

  /**
   * Sign in a person into the given position.
   *
   * @param {object} position
   * @param {int} slotId
   * @private
   */

  _signInPerson(position, slotId) {
    const person = this.args.person;

    const data = {
      position_id: position.id,
      person_id: person.id
    };

    if (slotId) {
      data.slot_id = slotId;
    }
    this.toast.clear();
    this.isSubmitting = true;
    this.ajax.request('timesheet/signin', {method: 'POST', data})
      .then((result) => {
        const callsign = person.callsign;
        switch (result.status) {
          case 'success':
            /*  if (result.forced) {
                // Shift start was forced, let the user know what was overridden.
                let reason;
                if (result.unqualified_reason === 'untrained') {
                  reason = `has not completed '${result.required_training}'`;
                } else {
                  reason = `is unqualified ('${result.unqualified_message}')`;
                }
                //this.modal.info('Sign In Forced', `WARNING: The person ${reason}. Because you are an admin or have the timesheet management role, we have signed them in anyways. Hope you know what you're doing! ${callsign} is now on duty.`);
              }
             */
            this.toast.success(`${callsign} is on shift. Happy Dusty Adventures!`);

            if (this.args.startShiftNotify) {
              this.args.startShiftNotify();
            }
            if (+person.id === this.session.userId) {
              // Ensure the navigation bar is updated with the signed in to position
              this.session.updateOnDuty();
            }
            break;

          case 'position-not-held':
            this.modal.info('Position Not Held', `${callsign} does hold the '${position.title}' in order to start the shift.`);
            break;

          case 'already-on-duty':
            this.modal.info('Already On Shift', `${callsign} is already on duty.`);
            break;

          case 'not-trained':
            this.modal.info('Not Trained', `${callsign} has has not completed "${result.position_title}" and cannot be signed into the shift.`);
            break;

          case 'not-qualified':
            this.modal.info('Not Qualified', `${callsign} has not meet one or more of the qualifiers needed to sign into the shift.<br>Reason: ${result.unqualified_message}`);
            break;

          default:
            this.modal.info('Unknown Server Status', `An unknown status [${result.status}] from the server. This is a bug. Please report this to the Tech Ninjas.`);
            break;
        }
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  /**
   * Start a shift with the selected position
   */

  @action
  startShiftAction() {
    this._startShift(this.signinPositionId);
  }

  /**
   * Start a shift based on a scheduled sign up.
   * @param slot
   */

  @action
  signinShiftAction(slot) {
    if (slot.is_within_start_time) {
      this._startShift(slot.position_id, slot.slot_id);
    } else {
      this.showEarlyShiftConfirm = true;
      this.earlySlot = slot;
    }
  }

  /**
   * End a shift.
   */

  @action
  endShiftAction() {
    const {onDutyEntry, endShiftNotify} = this.args;
    const callsign = this.args.person.callsign;

    this.isSubmitting = true;
    this.ajax.request(`timesheet/${onDutyEntry.id}/signoff`, {method: 'POST'})
      .then((result) => {
        this.store.pushPayload(result);
        if (endShiftNotify) {
          endShiftNotify();
        }
        switch (result.status) {
          case 'success':
            this.toast.success(`${callsign} has been successfully signed off. Enjoy your rest.`);
            if (+this.args.person.id === this.session.userId) {
              // Update the user's navigation bar to remove the signed in position.
              this.session.updateOnDuty();
            }
            break;

          case 'already-signed-off':
            this.toast.error(`${callsign} was already signed off.`);
            break;

          default:
            this.toast.error(`Unknown signoff response [${result.status}].`);
            break;
        }
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  /**
   * Update the selected sign in position
   * @param value
   */

  @action
  updateShiftPosition(value) {
    this.signinPositionId = value;
  }

  /**
   * Show the change position dialog
   */

  @action
  changePositionAction() {
    this.showPositionDialog = true;
    this.newPositionId = this.args.onDutyEntry.position_id;
    this.changePositionError = null;
  }

  /**
   * Update the signed in shift to the selected position
   */

  @action
  updatePositionAction() {
    const {onDutyEntry, person} = this.args;
    this.isSubmitting = true;
    this.changePositionError = null;

    this.ajax.request(`timesheet/${onDutyEntry.id}/update-position`, {
      method: 'PATCH',
      data: {
        position_id: this.newPositionId
      }
    }).then((result) => {
      switch (result.status) {
        case 'success':
          onDutyEntry.reload().finally(() => this.showPositionDialog = false);
          if (result.forced) {
            // Shift start was forced, let the user know what was overridden.
            let reason;
            if (result.unqualified_reason === 'untrained') {
              reason = `has not completed '${result.required_training}'`;
            } else {
              reason = `is unqualified ('${result.unqualified_message}')`;
            }
            this.modal.info('Shift Position Update Forced', `WARNING: The person ${reason}. Because you are an admin or have the timesheet management role,the position has been updated anyways.`);
          } else {
            this.toast.success('Position has been successfully updated.');
          }
          if (+person.id === this.session.userId) {
            // Ensure the navigation bar is updated with the signed in to position
            this.session.updateOnDuty();
          }
          return;

        case 'position-not-held':
          this.changePositionError = 'Person does not hold the position. Timesheet entry cannot be updated.';
          break;

        case 'not-trained':
          this.changePositionError = 'Person has not been trained for the position.';
          break;

        case 'not-qualified':
          this.changePositionError = `Person has not meet all the requirements in order to work the position. Reason: ${result.unqualified_message}`;
          break;

        default:
          this.changePositionError = `Cannot update the timesheet - unknown status [${result.status}]`;
          break;
      }
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  /**
   * Close out the correct position dialog
   */

  @action
  cancelUpdatePosition() {
    this.showPositionDialog = false;
    this.earlySlot = null;
  }

  /**
   * Close out the confirm start early shift check in dialog.
   */

  @action
  closeEarlyShiftAction() {
    this.showEarlyShiftConfirm = false;
  }

  /**
   * Start an early shift check in.
   */

  @action
  confirmEarlyShiftAction() {
    this.showEarlyShiftConfirm = false;
    this._startShift(this.earlySlot.position_id, this.earlySlot.slot_id);
    this.earlySlot = null;
  }
}
