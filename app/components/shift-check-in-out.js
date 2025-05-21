import Component from '@glimmer/component';
import EmberObject from '@ember/object';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {
  DIRT,
  DIRT_SHINY_PENNY,
  TRAINING,
  BURN_PERIMETER,
  NVO_RANGER,
  DPW_RANGER,
} from 'clubhouse/constants/positions';
import {cached, tracked} from '@glimmer/tracking';
import {INACTIVE, INACTIVE_EXTENSION, ECHELON} from 'clubhouse/constants/person_status';
import {ADMIN, CAN_FORCE_SHIFT, SHIFT_MANAGEMENT_SELF} from 'clubhouse/constants/roles';
import {buildBlockerLabels, TOO_SHORT_DURATION} from 'clubhouse/models/timesheet';
import {TYPE_TRAINING} from "clubhouse/models/position";
import _, {isEmpty} from 'lodash';
import {htmlSafe} from '@ember/template';
import hyperlinkText from "clubhouse/utils/hyperlink-text";
import {validatePresence} from 'ember-changeset-validations/validators';

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

  @tracked showPositionDialog = false;
  @tracked changePositionError = null;

  @tracked showTooShortDialog = false;

  @tracked showConfirmDeletion = false;

  @tracked showBlockers = false;
  @tracked forcePosition = null;
  @tracked showMayNotForceCheckIn = false;
  @tracked forceStartForm = null;

  @tracked inPersonTrainingPassed;
  @tracked userCanForceCheckIn;

  @tracked blockers;
  @tracked isPositionUpdate = false;


  tooShortDuration = TOO_SHORT_DURATION;

  forceShiftValidations = {
    reason: [validatePresence({presence: true, message: 'A reason must be entered.'})]
  }

  constructor() {
    super(...arguments);

    let {positions} = this.args;

    positions = positions.filter((p) => p.type !== TYPE_TRAINING);
    this.noTrainingRequiredPositions = positions.filter((p) => isEmpty(p.blockers));
    if (this.noTrainingRequiredPositions.length && this.args.isSelfServe) {
      this.activePositions = this.noTrainingRequiredPositions;
    } else {
      this.activePositions = positions;
    }


    const signins = this.activePositions.map((pos) => {
      return {id: pos.id, title: pos.title};
    });

    // hack for operator convenience - Dirt is the most common
    // shift, so put that at top.

    this._putOnTop(signins, DIRT);
    this._putOnTop(signins, DIRT_SHINY_PENNY);


    if (+this.args.person.id === this.session.userId && this.session.hasRole(SHIFT_MANAGEMENT_SELF)) {
      // Hacks for NVO / DPW Rangers who can sign themselves in and out.
      this._putOnTop(signins, DPW_RANGER);
      this._putOnTop(signins, NVO_RANGER);
    }

    this.signinPositions = signins;

    // Set the position options to the first item
    this.signinPositionId = this.signinPositions.length ? this.signinPositions[0].id : null;

    // Has the person gone through dirt training?
    if (this.args.person.status === ECHELON) {
      this.inPersonTrainingPassed = true;
    } else {
      const {eventInfo} = this.args;
      this.inPersonTrainingPassed = !!eventInfo.trainings.find((training) => (training.position_id === TRAINING && training.status === 'pass'));
    }

    this.userCanForceCheckIn = this.session.hasRole([ADMIN, CAN_FORCE_SHIFT]);
  }

  _putOnTop(signins, positionId) {
    const position = signins.find((p) => p.id === positionId);
    if (position) {
      _.pull(signins, position);
      signins.unshift(position);
    }
  }

  get isReturningRanger() {
    const {status} = this.args.person;
    return (status === INACTIVE || status === INACTIVE_EXTENSION);
  }

  /**
   * Does the person actually need a radio?
   *
   * @returns {boolean}
   */

  get mayNotNeedRadio() {
    const id = this.args.onDutyEntry?.position_id;
    return id === BURN_PERIMETER;
  }

  /**
   * Start a shift, check to see if the position can be started and if not, confirm a force start.
   *
   * @param {number} positionId
   * @param {number} slotId
   * @private
   */

  _startShift(positionId, slotId = null) {
    this._signInPerson(this.activePositions.find((p) => +p.id === +positionId), slotId);
  }

  /**
   * User confirmed yes, they do want to start the shift.
   */

  @action
  confirmForceStart(model, isValid) {
    if (!isValid) {
      return;
    }

    this.showBlockers = false;
    this._signInPerson(this.forcePosition, this.forceSlotId, model.reason, true);
  }

  /**
   * Cancel the forced shift start confirmation.
   */

  @action
  closeForceConfirm() {
    this.showBlockers = false;
    this.forcePosition = null;
    this.forceSlotId = null;
  }

  @action
  closeMayNotForceCheckIn() {
    this.showMayNotForceCheckIn = false;
    this.forcePosition = null;
    this.forceSlotId = null;
  }

  /**
   * Sign in a person into the given position.
   *
   * @param {object} position
   * @param {int} slotId
   * @param {string|null} reason
   * @private
   */

  async _signInPerson(position, slotId, reason = null, force = false) {
    const person = this.args.person;

    const data = {
      position_id: position.id,
      person_id: person.id
    };

    if (slotId) {
      data.slot_id = slotId;
    }

    if (force) {
      data.force_sign_in = true;
      data.signin_force_reason = reason;
    }

    this.isSubmitting = true;
    try {
      const result = await this.ajax.post('timesheet/signin', {data});
      const callsign = person.callsign;
      switch (result.status) {
        case 'success':
          this.toast.success(`${callsign} is on shift. Happy Dusty Adventures!`);

          this.args?.startShiftNotify();
          if (+person.id === this.session.userId) {
            // Ensure the navigation bar is updated with the signed in to position
            await this.session.updateOnDuty();
          }
          if (result.slot_url) {
            this._showShiftInfo(position.title, result.slot_url);
          }
          break;

        case 'blocked':
          this.isPositionUpdate = false;
          this.showBlockers = true;
          this.forcePosition = position;
          this.forceSlotId = slotId;
          this.blockers = buildBlockerLabels(result.blockers);
          this.forceStartForm = EmberObject.create({reason: ''});
          break;

        case 'position-not-held':
          this.modal.info('Position Not Held', `${callsign} does hold the '${position.title}' in order to start the shift.`);
          break;

        case 'missing-force-reason':
          this.modal.info('Missing Shift Force Reason', 'Since this check-in is being forced, a reason must be supplied');
          break;

        default:
          this.modal.info('Unknown Server Status', `An unknown status [${result.status}] from the server. This is a bug. Please report this to the Tech Ninjas.`);
          break;
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  _showShiftInfo(positionTitle, slotUrl) {
    this.modal.info(`Shift Information For ${positionTitle}`,
      htmlSafe(`<p>Convey the following information to the person:</p>${hyperlinkText(slotUrl)}`)
    );
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
  signInShiftAction(slot) {
    this._startShift(slot.position_id, slot.slot_id);
  }

  /**
   * End a shift. Check to see if the shift is too short.
   *
   */

  @action
  async endShiftAction() {
    this.isSubmitting = true;
    const entry = this.args.onDutyEntry;
    try {
      // Pick up the most recent times.
      await entry.reload();
      if (entry.duration < TOO_SHORT_DURATION) {
        this.showTooShortDialog = true;
      } else {
        await this._signoff();
      }
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      this.isSubmitting = false
    }
  }

  /**
   * Sign off a shift.
   *
   * @returns {Promise<void>}
   * @private
   */

  async _signoff(submitCorrection = false) {
    const {onDutyEntry, endShiftNotify} = this.args;
    try {
      const result = await this.ajax.request(`timesheet/${onDutyEntry.id}/signoff`, {method: 'POST'});
      const callsign = this.args.person.callsign;
      this.store.pushPayload(result);
      switch (result.status) {
        case 'success':
          await endShiftNotify?.(this.store.peekRecord('timesheet', result.timesheet.id), submitCorrection);
          this.toast.success(`${callsign} has been successfully signed off. Enjoy your rest.`);
          if (+this.args.person.id === this.session.userId) {
            // Update the user's navigation bar to remove the signed in position.
            await this.session.updateOnDuty();
          }
          break;

        case 'already-signed-off':
          this.toast.error(`${callsign} was already signed off.`);
          break;

        default:
          this.toast.error(`Unknown signoff response [${result.status}].`);
          break;
      }

      if (result.now_active_status) {
        await this.args.person.reload();
        this.modal.info('Returned To Active Status', `${callsign} has completed a non-training shift, and has been converted back to active status. Welcome them back to the department.`);
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  @action
  confirmEndShift() {
    this.showTooShortDialog = false;
    this._signoff();
  }

  @action
  closeTooShortDialog() {
    this.showTooShortDialog = false;
  }

  @action
  updatePositionInstead() {
    this.showTooShortDialog = false;
    this.changePositionAction();
  }

  @action
  askToDelete() {
    this.showTooShortDialog = false;
    this.showConfirmDeletion = true;
  }

  @action
  cancelAskToDelete() {
    this.showConfirmDeletion = false;
  }

  @action
  missedShiftCheckIn() {
    this.showTooShortDialog = false;
    this._signoff(true);
  }


  @action
  deleteEntry() {
    this.showTooShortDialog = false;
    this.modal.confirm('Confirm Timesheet Entry Deletion',
      `Are you absolutely sure you want to delete the entry?`,
      async () => {
        try {
          await this.ajax.request(`timesheet/${this.args.onDutyEntry.id}`, {method: 'DELETE'});
          this.toast.success('Entry successfully deleted');
          if (+this.args.person.id === this.session.userId) {
            // Update the user's navigation bar to remove the signed in position.
            this.session.updateOnDuty();
          }
          this.args.endShiftNotify?.(null);
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      });
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
    this._updatePosition(this.newPositionId);
  }

  async _updatePosition(position_id, reason = null, force = false) {
    const {onDutyEntry, person} = this.args;
    this.isSubmitting = true;
    this.changePositionError = null;

    try {
      const data = {
        position_id: this.newPositionId
      };
      if (force) {
        data.force_sign_in = true;
        data.signin_force_reason = reason;
      }

      const result = await this.ajax.patch(`timesheet/${onDutyEntry.id}/update-position`, {data});
      switch (result.status) {
        case 'success':
          await onDutyEntry.reload();
          this.showPositionDialog = false;
          this.toast.success('Position has been successfully updated.');
          if (+person.id === this.session.userId) {
            // Ensure the navigation bar is updated with the signed in to position
            await this.session.updateOnDuty();
          }

          if (result.slot_url) {
            this._showShiftInfo(result.position_title, result.slot_url);
          }
          return;

        case 'position-not-held':
          this.changePositionError = 'Person does not hold the position. Timesheet entry cannot be updated.';
          break;

        case 'position-not-eligible':
          this.changePositionError = 'The position is ineligible to be signed into.';
          break;

        case 'blocked':
          this.isPositionUpdate = true;
          this.showBlockers = true;
          this.forcePosition = this.activePositions.find((p) => +p.id === +this.newPositionId);
          this.blockers = buildBlockerLabels(result.blockers);
          this.forceStartForm = EmberObject.create({reason: ''});
          break;

        default:
          this.changePositionError = `Cannot update the timesheet - unknown status [${result.status}]`;
          break;
      }
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  confirmForcePosition(model, isValid) {
    if (!isValid) {
      return;
    }

    this.showBlockers = false;
    this._updatePosition(this.forcePosition.id, model.reason, true);
  }

  /**
   * Close out the correct position dialog
   */

  @action
  cancelUpdatePosition() {
    this.showPositionDialog = false;
  }

  @cached
  get selectedPosition() {
    return this.signinPositions.find((p) => p.id === +this.signinPositionId);
  }

  @cached
  get selectedPositionDisqualified() {
    const position = this.selectedPosition;

    return (!position || !position.disqualified) ? null : position.disqualified;
  }
}
