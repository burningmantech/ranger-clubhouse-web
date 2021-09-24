import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import _ from 'lodash';
import {ART_CAR_WRANGLER, BURN_PERIMETER, SANDMAN} from 'clubhouse/constants/positions';

class PersonShift {
  @tracked isSubmitting = false;
  @tracked isSignedIn = true;
  @tracked duration;
  @tracked on_duty;
  @tracked backOnShift = false;

  constructor(timesheet) {
    const {person} = timesheet;
    this.callsign = person.callsign;
    this.person_id = timesheet.person_id;
    this.duration = timesheet.duration;
    this.timesheetId = timesheet.id;
    this.on_duty = timesheet.on_duty;
    this.photo_url = timesheet.photo_url;
  }
}

export default class RollcallSignOutComponent extends Component {
  @service ajax;
  @service toast;
  @service house;

  @tracked isLoading;

  @tracked positions = [];
  @tracked timesheets = [];
  @tracked positionId = 0;
  @tracked position = null;

  constructor() {
    super(...arguments);

    this._loadTimesheets();
  }

  /**
   * Retrieve everyone who is on duty, and build up the positions options.
   *
   * @private
   */

  _loadTimesheets() {
    this.isLoading = true;
    this.ajax.request('timesheet', {data: {is_on_duty: 1, include_photo: 1}})
      .then((result) => {
        this.timesheets = result.timesheet;
        this.positions = _.map(
          _.groupBy(this.timesheets, 'position_id'),
          (entries, positionId) => ({
            id: positionId,
            title: entries[0].position.title,
            people: entries.map((entry) => new PersonShift(entry))
          })
        );
        this.positions.sort((a, b) => a.title.localeCompare(b.title));
        const options = this.positions.map((p) => [p.title, +p.id]);
        const burnPositions = [];
        [SANDMAN, BURN_PERIMETER, ART_CAR_WRANGLER].forEach((burnPosition) => {
          const found = options.find((p) => p[1] === burnPosition);
          if (found) {
            burnPositions.unshift(found);
            options.removeObject(found);
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
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }

  /**
   * Select the position to show
   *
   * @param positionId
   */

  @action
  selectPosition(positionId) {
    this.position = this.positions.find((p) => p.id === positionId);
  }

  /**
   * Sign out, or re-sign-in the person
   *
   * @param {PersonShift} person
   */

  @action
  clickPerson(person) {
    if (person.isSubmitting) {
      // Double click?
      return;
    }

    if (person.isSignedIn) {
      this._signOutPerson(person);
    } else {
      this._signInPerson(person);
    }
  }

  /**
   * Try to sign out the person
   *
   * @param {PersonShift} person
   */

  _signOutPerson(person) {
    person.isSubmitting = true;
    this.ajax.request(`timesheet/${person.timesheetId}/signoff`, {method: 'POST'})
      .then((result) => {
        const {timesheet} = result;
        person.isSignedIn = false;
        person.duration = timesheet.duration;
        switch (result.status) {
          case 'success':
            this.toast.success(`${person.callsign} has been signed off`);
            break;

          case 'already-signed-off':
            this.toast.error(`${person.callsign} was already signed off.`);
            person.isSignedIn = false;
            break;

          default:
            this.toast.error(`Unknown signoff response [${result.status}].`);
            break;
        }
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => person.isSubmitting = false)
  }

  /**
   *
   * @param {PersonShift} person
   */

  _signInPerson(person) {
    person.isSubmitting = true;
    this.ajax.request(`timesheet/${person.timesheetId}/resignin`, {method: 'POST', data: {person_id: person.person_id}})
      .then((result) => {
        const {timesheet, status} = result;
        switch (status) {
          case 'success':
            person.isSignedIn = true;
            person.duration = timesheet.duration;
            person.backOnShift = true;
            this.toast.success(`${person.callsign} is BACK ON SHIFT`);
            break;

          case 'already-on-duty':
            this.toast.error(`${person.callsign} is already on shift.`);
            person.isSignedIn = true;
            person.duration = timesheet.duration;
            break;

          default:
            this.toast.error(`Unknown signoff response [${status}].`);
            break;
        }

      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => person.isSubmitting = false)
  }
}
