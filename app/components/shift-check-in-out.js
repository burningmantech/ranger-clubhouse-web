import Component from '@glimmer/component';
import { set } from '@ember/object';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import * as Position from 'clubhouse/constants/positions';
import { tracked } from '@glimmer/tracking';

export default class ShiftCheckInOutComponent extends Component {
  person = null; // Person we're dealing with
  timesheets = null; // The timesheets
  positions = null; // And possible positions person can sign into.
  eventInfo = null; // Used to determine if person has been dirt trained

  imminentSlots = null; // (optional) slots that might be starting
  hasUnverifiedTimesheet = null; // (optional) true if entries are unverified
  endShiftNotify = null; // (optional) callback when a shift was successfully ended.

  @service ajax;
  @service house;
  @service modal;
  @service store;
  @service toast;

  @tracked signinPositionId = null;
  @tracked isSubmitting = false;
  @tracked isReloadingTimesheets = false;

  constructor() {
    super(...arguments);

    // Mark immeninate slots as trained or not.
    const slots = this.args.imminentSlots;
    if (slots) {
      slots.forEach((slot) => {
        const position = this.args.positions.find((p) => slot.position_id == p.id);
        if (position) {
          if (position.is_untrained) {
            set(slot, 'is_untrained', true);
          }

          if (position.is_unqualified) {
            set(slot, 'is_unqualified', true);
            set(slot, 'unqualified_reason', position.unqualified_reason);
          }
        }
      });
    }

    const signins = this.args.positions.map((pos) => {
      let title = pos.title;
      let disqualified = null;

      if (pos.is_untrained) {
        disqualified = 'UNTRAINED';
      } else if (pos.is_unqualified) {
        disqualified = pos.unqualified_reason;
      }

      if (disqualified) {
        title = `${title} (${disqualified.toUpperCase()})`;
      }

      return { id: pos.id, title };
    });

    // hack for operator convenience - Dirt is the most common
    // shift, so put that at top.

    const dirt = signins.find((p) => p.id == Position.DIRT);
    if (dirt) {
      signins.removeObject(dirt);
      signins.unshift(dirt);
    }

    // .. and Shiny Penny shift should also be on top
    const sp = signins.find((p) => p.id == Position.DIRT_SHINY_PENNY);
    if (sp) {
      signins.removeObject(sp);
      signins.unshift(sp);
    }

    this.signinPositions = signins;

    // Set the position options to the first item
    this.signinPositionId = this.signinPositions.firstObject.id;
  }

  // Has the person gone through dirt training?

  get isPersonDirtTrained() {
    if (this.args.person.status == 'non ranger') {
      return true;
    }

    return !!this.args.eventInfo.trainings.find((training) => (training.position_id == Position.TRAINING && training.status == 'pass'));
  }

  // Find the on duty shift
  @computed('args.timesheets.@each.off_duty')
  get onDutyEntry() {
    return this.args.timesheets.findBy('off_duty', null);
  }

  _startShift(positionId, slotId = null) {
    const position = this.args.positions.find((p) => p.id == positionId);
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
    this.ajax.request('timesheet/signin', { method: 'POST', data })
    .then((result) => {
      const callsign = person.callsign;
      switch (result.status) {
      case 'success':
        if (result.forced) {
          let reason;
          if (result.unqualified_reason) {
            reason = `is unqualified ('${result.unqualified_reason}')`;
          } else {
            reason = `has not completed '${result.required_training}'`;
          }
          this.modal.info('Sign In Forced', `WARNING: The person ${reason}. Because you are an admin or have the timesheet management role, we have signed them in anyways. Hope you know what you're doing! ${callsign} is now on duty.`);
        } else {
          this.toast.success(`${callsign} is on shift. Happy Dusty Adventures!`);
        }
        this.isReloadingTimesheets = true;
        // Refresh the timesheets
        this.args.timesheets.update()
          .catch((response) => this.house.handleErrorResponse(response))
          .finally(() => this.isReloadingTimesheets = false);
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
        this.modal.info('Not Qualified', `${callsign} has not meet one or more of the qualifiers needed to sign into the shift.<br>Reason: ${result.unqualified_reason}`);
        break;

      default:
        this.modal.info('Unknown Server Status', `An unknown status [${result.status}] from the server. This is a bug. Please report this to the Tech Ninjas.`);
        break;
      }
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.isSubmitting = false);
  }

  // Attempt to sign in the person to the selected position
  @action
  startShiftAction() {
    this._startShift(this.signinPositionId);
  }

  // Attempt sign in the person for a predictive shift position
  @action
  signinShiftAction(slot) {
    this._startShift(slot.position_id, slot.slot_id);
  }

  // End a person's shift.
  @action
  endShiftAction() {
    const shift = this.onDutyEntry;
    const endShiftNotify = this.args.endShiftNotify;
    const callsign = this.args.person.callsign;

    this.isSubmitting =  true;
    this.ajax.request(`timesheet/${shift.id}/signoff`, { method: 'POST' })
      .then((result) => {
        this.store.pushPayload(result);
        if (endShiftNotify) {
          endShiftNotify();
        }
        switch (result.status) {
        case 'success':
            this.toast.success(`${callsign} has been successfully signed off. Enjoy your rest.`);
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

  // Update the position signin
  @action
  updateShiftPosition(value) {
    this.signinPositionId = value;
  }
}
