import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { service } from '@ember-decorators/service';

export default class PersonShiftManageComponent extends Component {
  @argument person;     // Person we're dealing with
  @argument timesheets; // The timesheets
  @argument positions;  // And possible positions person can sign into.

  @service  store;


  // Build a position list with the postfix ' (untrained)' added
  // if the person has not been trained for that.
  @computed('positions')
  get signinPositions() {
    const signins = this.positions.map((pos) => {
      if (pos.training_required && !pos.is_trained) {
        return { id: pos.id, title: `${pos.title} (untrained)` };
      } else {
        return { id: pos.id, title: pos.title }
      }
    });

    // hack for operator convenience - Dirt is the most common
    // shift, so put that at top.

    const dirt = signins.find((p) => p.id == 2);
    if (dirt) {
      signins.removeObject(dirt);
      signins.unshift(dirt);
    }

    this.set('signinPositionId', signins.firstObject.id);
    return signins;
  }

  // Has the person gone through dirt training?

  @computed
  get isPersonDirtTrained() {
    const dirt = this.positions.find((p) => p.id == 2);

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

  // Attempt to sign in the person to the selected position
  @action
  signinShiftAction() {
    const position_id = this.signinPositionId;
    const position = this.positions.find((p) => p.id == position_id);

    if (!position) {
      // wrut'oh! not good...
      this.toast.error("BUG? Cannot find the position?");
      return;
    }

    this.ajax.request('timesheet/signin', {
      method: 'POST',
      data: { position_id, person_id: this.person.id }
    }).then((result) => {
      const callsign = this.person.callsign;
      if (result.meta.forced) {
        this.toast.error(`WARNING: The person was has not completed '${position.training_title}'. Because you are an admin, we have signed them in anyways. Hope you know what you're doing! ${callsign} is now on duty.`);
      } else {
        this.toast.success(`${callsign} is on shift. Happy Rangering!`);
      }
      this.timesheets.update(); // Refresh the timesheets
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  // End a person's shift.
  @action
  endShiftAction() {
    const shift = this.onDutyEntry;

    this.ajax.request(`timesheet/${shift.id}/signoff`, { method: 'POST' })
      .then((result) => {
        this.store.pushPayload(result);
        this.toast.success(`${this.person.callsign} has been successfully signed out.`);
      }).catch((response) => this.house.handleErrorResponse(response));
  }

  // Update the position signin
  @action
  updateShiftPosition(value) {
    this.set('signinPositionId', value);
  }
}
