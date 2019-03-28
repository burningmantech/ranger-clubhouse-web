import Component from '@ember/component';
import { set } from '@ember/object';
import { action, computed } from '@ember-decorators/object';
import { argument
} from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { inject as service } from '@ember-decorators/service';
import * as Position from 'clubhouse/constants/positions';

export default class ShiftCheckInOutComponent extends Component {
  @argument('object') person; // Person we're dealing with
  @argument('object') timesheets; // The timesheets
  @argument('object') positions; // And possible positions person can sign into.
  @argument(optional('object')) imminentSlots; // (optional) slots that might be starting
  @argument(optional('any')) hasUnverifiedTimesheetEntries; // (optional) true if entries are unverified
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
        if (position && position.training_required) {
          set(slot, 'is_trained', position.is_trained);
        } else {
          set(slot, 'is_trained', true);
        }
      });
    }
  }

  // Build a position list with the postfix ' (untrained)' added
  // if the person has not been trained for that.
  @computed('positions')
  get signinPositions() {
    const signins = this.positions.map((pos) => {
      if (pos.training_required && !pos.is_trained) {
        return { id: pos.id, title: `${pos.title} (UNTRAINED)` };
      } else {
        return { id: pos.id, title: pos.title };
      }
    });

    // hack for operator convenience - Dirt is the most common
    // shift, so put that at top.

    const dirt = signins.find((p) => p.id == 2);
    if (dirt) {
      signins.removeObject(dirt);
      signins.unshift(dirt);
    }

    return signins;
  }

  // Has the person gone through dirt training?

  @computed
  get isPersonDirtTrained() {
    const dirt = this.positions.find((p) => p.id == Position.DIRT);

    // Fail safe..
    if (!dirt || !dirt.training_required) {
      return false;
    }

    return dirt.is_trained;
  }

  // Find the on duty shift
  @computed('timesheets.@each.off_duty')
  get onDutyEntry() {
    return this.timesheets.findBy('off_duty', null);
  }

  _startShift(positionId) {
    const position = this.positions.find((p) => p.id == positionId);

    this.toast.clear();
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
          this.toast.error(`WARNING: The person has not completed '${position.training_title}'. Because you are an admin, we have signed them in anyways. Hope you know what you're doing! ${callsign} is now on duty.`);
        } else {
          this.toast.success(`${callsign} is on shift. Happy Dusty Adventures!`);
        }
        this.timesheets.update(); // Refresh the timesheets
        break;

      case 'position-not-held':
        this.toast.error(`The person does hold the '${position.title}' in order to start the shift.`);
        break;

      case 'already-on-duty':
        this.toast.error('The person is already on duty.');
        break;

      case 'not-trained':
        this.toast.error(`The person has not pass training for ${result.position_title}`);
        break;

      default:
        this.toast.error(`An unknown status [${result.status}] from the server.`);
        break;
      }
    }).catch((response) => this.house.handleErrorResponse(response));
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

    this.ajax.request(`timesheet/${shift.id}/signoff`, { method: 'POST' })
      .then((result) => {
        this.store.pushPayload(result);
        if (this.endShiftNotify) {
          this.endShiftNotify();
        }
        this.toast.success(`${this.person.callsign} has been successfully signed out.`);
      }).catch((response) => this.house.handleErrorResponse(response));
  }

  // Update the position signin
  @action
  updateShiftPosition(value) {
    this.set('signinPositionId', value);
  }
}
