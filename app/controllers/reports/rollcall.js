import Controller from '@ember/controller';
import {action, computed, set} from '@ember/object';
import moment from 'moment';

export default class ReportsRollcallController extends Controller {
  @computed('positionId', 'positions')
  get slotOptions() {
    const position = this.positions.find((p) => p.id == this.positionId);
    if (position == null) {
      return [];
    }

    const options = position.slots.map((s) => [`${moment(s.begins).format('ddd MMM DD [@] HH:mm')} (${s.description})`, s.id]);
    options.unshift(['Select Shift', 0]);
    return options;
  }

  /*
   * Select a new position, and clear out the shift selection.
   */

  @action
  selectPosition(positionId) {
    this.set('positionId', positionId);
    this.set('slotId', 0);
    this.set('slot', null);
    this.set('people', []);
    this.set('position', this.positions.find((p) => p.id == positionId));
  }

  /*
   * Select a shift, and look up who has signed up
   */

  @action
  selectSlot(slotId) {
    this.set('slotId', slotId);
    if (!slotId) {
      return;
    }

    this.set('slot', this.position.slots.find((s) => s.id == slotId));

    this.set('isRetrievingPeople', true);
    this.ajax.request(`slot/${slotId}/people`, {data: {is_onduty: 1, include_photo: 1}})
      .then((result) => this.set('people', result.people))
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isRetrievingPeople', false));
  }

  /*
   * Sign in or out a person
   */

  @action
  clickPerson(person) {
    if (person.isSubmitting) {
      // double click?
      return;
    }

    if (!person.signedIn && !person.on_duty) {
      this._signonPerson(person);
    } else {
      this.modal.confirm(`Sign Out ${person.callsign}`, `Do you wish to sign out ${person.callsign}?`, () => {
        const timesheetId = (person.on_duty ? person.on_duty.id : person.timesheet_id);
        set(person, 'isSubmitting', true);
        this.ajax.request(`timesheet/${timesheetId}/signoff`, {method: 'POST'})
          .then((result) => {
            set(person, 'signedIn', false);
            set(person, 'on_duty', null);
            set(person, 'timesheet_id', null);

            switch (result.status) {
              case 'success':
                break;

              case 'already-signed-off':
                this.toast.error(`${person.callsign} was already signed off.`);
                break;

              default:
                this.toast.error(`Unknown signoff response [${result.status}].`);
                break;
            }
          }).catch((response) => this.house.handleErrorResponse(response))
          .finally(() => set(person, 'isSubmitting', false))
      });
    }
  }

  _signonPerson(person) {
    set(person, 'isSubmitting', true);
    this.ajax.request('timesheet/signin', {
      method: 'POST',
      data: {
        position_id: this.positionId,
        person_id: person.id,
        slot_id: this.slotId
      }
    }).then((result) => {
      const callsign = person.callsign;
      switch (result.status) {
        case 'success':
          if (result.forced) {
            let reason;
            if (result.unqualified_reason === 'untrained') {
              reason = `has not completed '${result.required_training}'`;
            } else {
              reason = `is unqualified ('${result.unqualified_message}')`;
            }
            this.modal.info('Sign In Forced', `WARNING: The person ${reason}. Because you are an admin or have the timesheet management role, we have signed them in anyways. Hope you know what you're doing! ${callsign} is now on duty.`);
          }
          set(person, 'signedIn', true);
          set(person, 'timesheet_id', result.timesheet_id);
          break;

        case 'position-not-held':
          this.modal.info('Position Not Held', `${callsign} does hold the position in order to start the shift.`);
          break;

        case 'already-on-duty':
          this.modal.info('Already On Shift', 'The person is already on duty.');
          set(person, 'on_duty', result.timesheet);
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
      .finally(() => set(person, 'isSubmitting', false));
  }
}
