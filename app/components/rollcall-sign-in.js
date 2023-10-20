import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import _ from 'lodash';
import dayjs from 'dayjs';
import {ART_CAR_WRANGLER, BURN_PERIMETER, SANDMAN} from 'clubhouse/constants/positions';

class PersonSignIn {
  @tracked signedIn = false; // is the person signed in?
  @tracked on_duty; // Timesheet person is already signed into.
  @tracked timesheet_id = null;
  @tracked isSubmitting = false;
  @tracked startTime; // What time did the person start the shift?

  constructor(obj) {
    Object.assign(this, obj);
  }
}

export default class RollcallSignInComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service toast;

  @tracked positionId = 0;
  @tracked slotId = 0;
  @tracked slot = null;
  @tracked people = null;
  @tracked positions = null;
  @tracked position = null;

  @tracked isRetrievingPeople = false;
  @tracked isSubmitting = false;
  @tracked isLoading = false;

  constructor() {
    super(...arguments);

    this.isLoading = true;

    // Load up all available slots
    this.ajax.request('slot', {data: {for_rollcall: 1}})
      .then(({slot}) => this._setupPositions(slot))
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }

  /**
   * Build the slot options
   *
   * @returns {[]}
   */

  get slotOptions() {
    const position = this.positions.find((p) => +p.id === this.positionId);
    if (position == null) {
      return [];
    }

    const options = position.slots.map((s) => [`${dayjs(s.begins).format('ddd MMM DD [@] HH:mm')} (${s.description})`, s.id]);
    options.unshift(['Select Shift', 0]);
    return options;
  }

  /**
   * Take the slots returned by the backend, build up the positions.
   * @param slots
   * @private
   */
  _setupPositions(slots) {
    const positions = _.sortBy(_.map(_.groupBy(slots, 'position_id'), (slots) => {
      const position = slots[0].position;

      return {
        id: +position.id,
        title: position.title,
        slots
      };
    }), 'title');

    this.positions = positions;
    this.positionId = 0;
    this.people = null;

    // Organize the positions options so the Burn shifts are on top.
    const options = positions.map((p) => [p.title, +p.id]);
    const burnPositions = [];
    [SANDMAN, BURN_PERIMETER, ART_CAR_WRANGLER].forEach((burnPosition) => {
      const found = options.find((p) => p[1] === burnPosition);
      if (found) {
        burnPositions.unshift(found);
        _.pull(options, found);
      }
    });

    this.positionOptions = [
      ['Select Position', 0],
      {
        groupName: 'Burn Positions',
        options: burnPositions
      },
      {
        groupName: 'Everything Else',
        options
      }
    ];

  }

  /**
   * Select a new position, and clear out the shift selection.
   *
   * @param {number} positionId
   */

  @action
  selectPosition(positionId) {
    positionId = +positionId;
    this.positionId = positionId;
    this.people = [];
    this.position = this.positions.find((p) => p.id === positionId);
    if (this.position && this.position.slots.length === 1) {
      const slot = this.position.slots[0];
      // Go ahead and preselect the only slot.
      this.slotId = slot.id;
      this.slot = slot;
      this._retrievePeople();
    } else {
      this.slotId = 0;
      this.slot = null;
    }
  }

  /**
   * Select a shift, and look up who has signed up
   *
   * @param {number} slotId
   */

  @action
  selectSlot(slotId) {
    slotId = +slotId;
    this.slotId = slotId;
    if (!slotId) {
      return;
    }

    this.slot = this.position.slots.find((s) => s.id === slotId);
    this._retrievePeople();
  }

  /**
   * Retrieve the people signed up for a given slot/shift
   *
   * @private
   */

  async _retrievePeople() {
    this.isRetrievingPeople = true;
    try {
      const {people} = await this.ajax.request(`slot/${this.slot.id}/people`,
        {data: {is_onduty: 1, include_photo: 1}});
      this.people = people.map((p) => new PersonSignIn(p));
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      this.isRetrievingPeople = false;
    }
  }

  /**
   * Sign in or out a person
   *
   * @param {PersonSignIn} person
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
      // Person is on duty - confirm sign out.
      this.modal.confirm(`Sign Out ${person.callsign}`,
        `Do you wish to sign out ${person.callsign}?`,
        async () => {
          const timesheetId = (person.on_duty ? person.on_duty.id : person.timesheet_id);
          person.isSubmitting = true;
          try {
            const result = await this.ajax.request(`timesheet/${timesheetId}/signoff`, {method: 'POST'});
            person.signedIn = false;
            person.on_duty = null;
            person.timesheet_id = null;

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
          } catch (response) {
            this.house.handleErrorResponse(response);
          } finally {
            person.isSubmitting = false;
          }
        }
      );
    }
  }

  /**
   * Sign a person into a shift
   *
   * @param {PersonSignIn} person
   * @private
   */

  async _signonPerson(person) {
    person.isSubmitting = true;
    try {
      const result = await this.ajax.request('timesheet/signin', {
        method: 'POST',
        data: {
          position_id: this.positionId,
          person_id: person.id,
          slot_id: this.slotId
        }
      });
      const {callsign} = person;
      switch (result.status) {
        case 'success':
          if (result.forced) {
            let reason;
            if (result.unqualified_reason === 'untrained') {
              reason = `has not completed '${result.required_training}'`;
            } else {
              reason = `is unqualified ('${result.unqualified_message}')`;
            }
            this.modal.info('Sign In Forced', `<p><b class="text-danger">WARNING: The person ${reason}.</b></p> Because you are an admin or have the timesheet management role, we have signed them in anyways. Hope you know what you're doing! ${callsign} is now on duty.`);
          }
          person.signedIn = true;
          person.timesheet_id = result.timesheet_id;
          person.startTime = result.on_duty;
          break;

        case 'position-not-held':
          this.modal.info('Position Not Held', `${callsign} does hold the position in order to start the shift.`);
          break;

        case 'already-on-duty':
          this.modal.info('Already On Shift', 'The person is already on duty.');
          person.signedIn = true;
          person.on_duty = result.timesheet;
          person.timesheet_id = result.timesheet.id;
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
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      person.isSubmitting = false
    }
  }
}
