import Component from '@ember/component';
import { set } from '@ember/object';
import { action, computed } from '@ember/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { inject as service } from '@ember/service';
import * as Position from 'clubhouse/constants/positions';

export default class ShiftCheckInOutComponent extends Component {
  @argument('object') person; // Person we're dealing with
  @argument('object') timesheets; // The timesheets
  @argument('object') positions; // And possible positions person can sign into.
  @argument('object') eventInfo; // Used to determine if person has been dirt trained

  @argument(optional('object')) imminentSlots; // (optional) slots that might be starting
  @argument(optional('any')) hasUnverifiedTimesheet; // (optional) true if entries are unverified
  @argument(optional('object')) endShiftNotify; // (optional) callback when a shift was successfully ended.

  @service store;

  signinPositionId = null;

  didReceiveAttrs() {
    // Set the position options to the first item
    this.set('signinPositionId', this.get('signinPositions.firstObject.id'));

    const slots = this.imminentSlots;

    // Mark immeninate slots as trained or not.
    if (slots) {
      const positions = this.positions;
      slots.forEach((slot) => {
        const position = positions.find((p) => slot.position_id == p.id);
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
  }

  // Build a position list with the postfix ' (untrained)' added
  // if the person has not been trained for that.
  @computed('positions')
  get signinPositions() {
    const signins = this.positions.map((pos) => {
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

    return signins;
  }

  // Has the person gone through dirt training?

  @computed('eventInfo.training.@each.position_id')
  get isPersonDirtTrained() {
    if (this.person.status == 'non ranger') {
      return true;
    }

    return !!this.eventInfo.trainings.find((training) => (training.position_id == Position.DIRT && training.status == 'pass'));
  }

  // Find the on duty shift
  @computed('timesheets.@each.off_duty')
  get onDutyEntry() {
    return this.timesheets.findBy('off_duty', null);
  }

  _startShift(positionId) {
    const position = this.positions.find((p) => p.id == positionId);

    this.toast.clear();
    this.set('isSubmitting', true);
    this.ajax.request('timesheet/signin', {
      method: 'POST',
      data: {
        position_id: position.id,
        person_id: this.person.id
      }
    }).then((result) => {
      const callsign = this.person.callsign;
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
        this.set('isReloadingTimesheets', true);
        // Refresh the timesheets
        this.timesheets.update()
        .catch((response) => this.house.handleErrorResponse(response))
        .finally(() => { this.set('isReloadingTimesheets', false) });
        break;

      case 'position-not-held':
        this.modal.info('Position Not Held', `${callsign} does hold the '${position.title}' in order to start the shift.`);
        break;

      case 'already-on-duty':
        this.modal.info('Already On Shift', 'The person is already on duty.');
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
    .finally(() => this.set('isSubmitting', false));
  }

  // Attempt to sign in the person to the selected position
  @action
  signinShiftAction() {
    this._startShift(this.signinPositionId);
  }

  // Attempt sign in the person for a predictive shift position
  @action
  signinPositionAction(positionId) {
    this._startShift(positionId);
  }

  // End a person's shift.
  @action
  endShiftAction() {
    const shift = this.onDutyEntry;

    this.set('isSubmitting', true);
    this.ajax.request(`timesheet/${shift.id}/signoff`, { method: 'POST' })
      .then((result) => {
        this.store.pushPayload(result);
        if (this.endShiftNotify) {
          this.endShiftNotify();
        }
        this.toast.success(`${this.person.callsign} has been successfully signed out.`);
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isSubmitting', false));
  }

  // Update the position signin
  @action
  updateShiftPosition(value) {
    this.set('signinPositionId', value);
  }
}
