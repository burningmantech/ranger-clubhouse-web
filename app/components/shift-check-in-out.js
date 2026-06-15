import Component from '@glimmer/component';
import EmberObject from '@ember/object';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {
  DIRT,
  DIRT_SHINY_PENNY,
  BURN_PERIMETER,
  NVO_RANGER,
  DPW_RANGER, TOW_TRUCK_TRAINING, TROUBLESHOOTER_TRAINING, SANDMAN_TRAINING,
} from 'clubhouse/constants/positions';
import {tracked} from '@glimmer/tracking';
import {ECHELON} from 'clubhouse/constants/person_status';
import {ADMIN, CAN_FORCE_SHIFT, SHIFT_MANAGEMENT_SELF} from 'clubhouse/constants/roles';
import {buildBlockerLabels, TOO_SHORT_DURATION} from 'clubhouse/models/timesheet';
import {TYPE_TRAINING} from "clubhouse/models/position";
import _, {isEmpty} from 'lodash';
import {htmlSafe} from '@ember/template';
import hyperlinkText from "clubhouse/utils/hyperlink-text";
import Ember from 'ember';
import {validatePresence} from 'ember-changeset-validations/validators';

const escapeExpression = Ember.Handlebars.Utils.escapeExpression;

export default class ShiftCheckInOutComponent extends Component {
  @service ajax;
  @service command;
  @service errors;
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
  @tracked newPositionId = null;
  @tracked forceSlotId = null;

  @tracked inPersonTrainingPassed;
  @tracked userCanForceCheckIn;

  @tracked blockers;

  // Distinguishes whether the blocker modal is confirming a shift check-in or a
  // position update, used purely to pick the user-facing wording. The actual
  // action to run on confirmation is stored in `_forceConfirm`.
  @tracked forceIsPositionUpdate = false;

  // Positions derived in the constructor.
  activePositions = [];
  noTrainingRequiredPositions = [];
  signinPositions = [];

  // The callback to invoke (with the operator-supplied reason) when a blocked
  // action is force-confirmed.
  _forceConfirm = null;

  tooShortDuration = TOO_SHORT_DURATION;

  forceShiftValidations = {
    reason: [validatePresence({presence: true, message: 'A reason must be entered.'})]
  };

  constructor() {
    super(...arguments);

    let {positions} = this.args;

    positions = positions.filter((p) => {
      if (p.type !== TYPE_TRAINING) {
        return true;
      }

      if (p.title.match(/trainer/i)) {
        return true;
      }

      return  (p.id === TOW_TRUCK_TRAINING || p.id === TROUBLESHOOTER_TRAINING || p.id === SANDMAN_TRAINING);
    });
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
      this.inPersonTrainingPassed = this.args.eventInfo.in_person_training_passed;
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

  /**
   * If the timesheet entry being modified belongs to the signed-in user, refresh
   * the navigation bar so it reflects the current on-duty position.
   *
   * @returns {Promise<void>}
   * @private
   */

  async _refreshNavIfSelf() {
    if (+this.args.person.id === this.session.userId) {
      await this.session.updateOnDuty();
    }
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
   * The title shown on the blocker modal.
   *
   * @returns {string}
   */

  get blockedTitle() {
    return `${this.forceIsPositionUpdate ? 'Position Update' : 'Check In'} Is Blocked`;
  }

  /**
   * The phrase describing the blocked action in the modal body.
   *
   * @returns {string}
   */

  get blockedPhrase() {
    return this.forceIsPositionUpdate ? 'position update' : 'shift check in';
  }

  /**
   * The phrase describing the action a privileged operator can force.
   *
   * @returns {string}
   */

  get forcePhrase() {
    return this.forceIsPositionUpdate ? 'the position update' : 'check in';
  }

  /**
   * The phrase used when referring the person to an HQ Lead.
   *
   * @returns {string}
   */

  get referPhrase() {
    return this.forceIsPositionUpdate ? 'position update' : 'shift check-in';
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
   * User confirmed yes, they do want to force the blocked action.
   */

  @action
  confirmForce(model, isValid) {
    if (!isValid) {
      return;
    }

    this.showBlockers = false;
    this._forceConfirm?.(model.reason);
  }

  /**
   * Cancel the forced shift start confirmation.
   */

  @action
  closeForceConfirm() {
    this.showBlockers = false;
    this.forcePosition = null;
    this.forceSlotId = null;
    this._forceConfirm = null;
  }

  @action
  closeMayNotForceCheckIn() {
    this.showMayNotForceCheckIn = false;
    this.forcePosition = null;
    this.forceSlotId = null;
  }

  /**
   * Open the blocker confirmation modal for a blocked action.
   *
   * @param {boolean} isPositionUpdate true if confirming a position update, false for a check-in
   * @param {object[]} blockers raw blockers returned by the server
   * @param {function(string):void} onConfirm invoked with the operator-supplied reason
   * @private
   */

  _showBlockers(isPositionUpdate, blockers, onConfirm) {
    this.forceIsPositionUpdate = isPositionUpdate;
    this.showBlockers = true;
    this.blockers = buildBlockerLabels(blockers);
    this.forceStartForm = EmberObject.create({reason: ''});
    this._forceConfirm = onConfirm;
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
    if (this.isSubmitting) {
      return;
    }

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

    const callsign = person.callsign;
    this.isSubmitting = true;
    try {
      await this.command.perform('timesheet/signin', data, {
        statusHandlers: {
          success: async (result) => {
            this.toast.success(`${callsign} is on shift. Happy Dusty Adventures!`);

            this.args.startShiftNotify?.();
            // Ensure the navigation bar is updated with the signed in to position
            await this._refreshNavIfSelf();
            if (result.slot_url) {
              this._showShiftInfo(position.title, result.slot_url);
            }
          },

          blocked: (result) => {
            this.forcePosition = position;
            this.forceSlotId = slotId;
            this._showBlockers(false, result.blockers,
              (forceReason) => this._signInPerson(position, slotId, forceReason, true));
          },

          'position-not-held': () => {
            this.modal.info('Position Not Held', `${callsign} does NOT hold the '${position.title}' and cannot start the shift.`);
          },

          'missing-force-reason': () => {
            this.modal.info('Missing Shift Force Reason', 'Since this check-in is being forced, a reason must be supplied');
          },
        },
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  _showShiftInfo(positionTitle, slotUrl) {
    // Escape the (server-supplied) slot URL/text BEFORE auto-linking so it
    // cannot inject markup once handed to htmlSafe (stored XSS guard).
    this.modal.info(`Shift Information For ${positionTitle}`,
      htmlSafe(`<p>Convey the following information to the person:</p>${hyperlinkText(escapeExpression(slotUrl))}`)
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
    if (this.isSubmitting) {
      return;
    }

    const entry = this.args.onDutyEntry;
    let tooShort = false;
    this.isSubmitting = true;
    try {
      // Pick up the most recent times.
      await entry.reload();
      tooShort = entry.duration < TOO_SHORT_DURATION;
    } catch (response) {
      this.errors.handleErrorResponse(response);
      return;
    } finally {
      this.isSubmitting = false;
    }

    if (tooShort) {
      this.showTooShortDialog = true;
    } else {
      await this._signoff();
    }
  }

  /**
   * Sign off a shift.
   *
   * @returns {Promise<void>}
   * @private
   */

  async _signoff(submitCorrection = false) {
    if (this.isSubmitting) {
      return;
    }

    const {onDutyEntry, endShiftNotify} = this.args;
    this.isSubmitting = true;
    try {
      const result = await this.ajax.request(`timesheet/${onDutyEntry.id}/signoff`, {method: 'POST'});
      const callsign = this.args.person.callsign;
      this.store.pushPayload(result);
      switch (result.status) {
        case 'success':
          await endShiftNotify?.(this.store.peekRecord('timesheet', result.timesheet.id), submitCorrection);
          this.toast.success(`${callsign} has been successfully signed off. Enjoy your rest.`);
          // Update the user's navigation bar to remove the signed in position.
          await this._refreshNavIfSelf();
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
      this.errors.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
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
          // Update the user's navigation bar to remove the signed in position.
          await this._refreshNavIfSelf();
          this.args.endShiftNotify?.(null);
        } catch (response) {
          this.errors.handleErrorResponse(response);
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
   * Update the position selected in the correct-position dialog.
   * @param value
   */

  @action
  updateNewPosition(value) {
    this.newPositionId = value;
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

  async _updatePosition(positionId, reason = null, force = false) {
    if (this.isSubmitting) {
      return;
    }

    const {onDutyEntry} = this.args;
    this.isSubmitting = true;
    this.changePositionError = null;

    try {
      const data = {
        position_id: positionId
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
          // Ensure the navigation bar is updated with the signed in to position
          await this._refreshNavIfSelf();

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
          this.forcePosition = this.activePositions.find((p) => +p.id === +positionId);
          this._showBlockers(true, result.blockers,
            (forceReason) => this._updatePosition(positionId, forceReason, true));
          break;

        default:
          this.changePositionError = `Cannot update the timesheet - unknown status [${result.status}]`;
          break;
      }
    } catch (response) {
      this.errors.handleErrorResponse(response)
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Close out the correct position dialog
   */

  @action
  cancelUpdatePosition() {
    this.showPositionDialog = false;
  }
}
