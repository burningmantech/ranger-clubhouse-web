import Service from '@ember/service';
import {service} from '@ember/service';
import {shiftFormat} from 'clubhouse/helpers/shift-format';

import ModalMultipleEnrollmentComponent from 'clubhouse/components/modal-multiple-enrollment';
import ModalMissingRequirementsComponent from 'clubhouse/components/modal-missing-requirements';
import ModalConfirmMultipleEnrollmentComponent from 'clubhouse/components/modal-confirm-multiple-enrollment';
import ModalConfirmMissingRequirementsComponent from 'clubhouse/components/modal-confirm-missing-requirements';

export default class ShiftManageService extends Service {
  @service ajax;
  @service house;
  @service modal;
  @service session;
  @service toast;

  /**
   * Attempt to add the given person to a slot
   *
   * @param slot
   * @param person
   * @param {Function} callback
   * @param {boolean} force
   */

  slotSignup(slot, person, callback = null, force = false) {
    slot.isSubmitting = true;

    this.ajax.request(`person/${person.id}/schedule`, {
      method: 'POST',
      data: {slot_id: slot.id, force: (force ? 1 : 0)}
    }).then((result) => {
      slot.isSubmitting = false;
      if (result.status !== 'success') {
        this.handleSignupError(result, slot, person, callback);
        return;
      }

      const isMe = +this.session.userId === +person.id;
      const name = isMe ? "You are" : `${person.callsign}  is`;

      slot.slot_signed_up = result.signed_up;
      const forcedReasons = [];

      if (result.has_started) {
        forcedReasons.push('the shift has started');
      }

      if (result.overcapacity) {
        forcedReasons.push('the shift is overcapacity');
      }

      if (result.multiple_enrollment) {
        forcedReasons.push(`${person.callsign} has multiple enrollments`);
      }

      if (forcedReasons.length > 0) {
        let sentence;
        if (forcedReasons.length === 1) {
          sentence = forcedReasons[0];
        } else {
          sentence = forcedReasons.slice(0, forcedReasons.length - 1).join(', ') + ", and " + forcedReasons.slice(-1)
        }
        this.toast.warning(`${name} successfully signed up. Note: ${sentence}.`);
      } else {
        this.toast.success('Successfully signed up.');
      }

      if (callback) {
        callback(result);
      }
    }).catch((response) => {
      slot.isSubmitting = false;
      this.house.handleErrorResponse(response);
    });
  }

  /**
   * Handle a signup error.
   *
   * @param {*} result
   * @param {*} slot
   * @param {PersonModel} person
   * @param {null|Function}callback
   */

  handleSignupError(result, slot, person, callback) {
    const status = result.status;
    const isMe = +this.session.userId === +person.id;

    slot.slot_signed_up = result.signed_up;

    if (result.may_force) {
      // The signup may be forced by the user.
      this.mayForceSignup(result, slot, person, callback);
      return;
    }

    switch (status) {
      case 'full':
        this.modal.info(
          'Shift Is Full',
          'Sorry, the shift has become full and no more sign ups are allowed.'
        );
        break;

      case 'no-slot':
        this.modal.info(
          'BUG: Shift Not Found?',
          `The shift id=[${slot.id}] was not found in the database. This looks like a bug, please report this!`
        );
        break;

      case 'no-position':
        this.modal.info(
          'Position not held',
          `${isMe ? "You must have" : person.callsign + " needs"} the position "${result.position_title}" in order to sign up for this shift.`
        );
        break;

      case 'exists':
        this.modal.info(
          'Already Signed Up',
          `${isMe ? "You are" : person.callsign + " is"} already signed up for this shift.`
        );
        break;

      case 'not-active':
        this.modal.info(
          'Inactive Shift',
          'The shift has not been activated yet and sign ups are not allowed. Please check back later and try again.'
        );
        break;

      case 'multiple-enrollment':
        this.modal.open(
          ModalMultipleEnrollmentComponent,
          {
            enrolledSlots: result.slots,
            person,
            slot
          });
        break;

      case 'missing-requirements':
        this.modal.open(
          ModalMissingRequirementsComponent, {
            requirements: result.requirements,
            hasTrainingBlocker: !result.training_signups_allowed,
            person,
            slot
          });
        break;

      case 'no-employee-id':
        this.modal.info(
          'Paid Shift',
          `The shift is a paid position, and ${isMe ? 'you do' : person.callsign + ' does'} not have a Paycom ID entered into the Clubhouse. Please talk with this position's manager to resolve the issue.`
        );
        break;

      default:
        this.modal.info(
          'BUG: Unknown Status Response',
          `Sorry, I did not understand the status response of [${status}] from the server. This is a BUG and should be reported.`
        );
        break;
    }
  }

  /**
   * Alert the user the signup failed but may be forced.
   *
   * @param result
   * @param slot
   * @param person
   * @param callback
   */

  mayForceSignup(result, slot, person, callback) {
    const signupCallback = () => this.slotSignup(slot, person, callback, true);

    switch (result.status) {
      case 'full':
        this.modal.confirm(
          'Shift is at capacity',
          'The shift is full, however you have the privileges to add this shift to the schedule. Please confirm you wish to force add the shift to the schedule.',
          signupCallback
        );
        return;

      case 'has-started':
        this.modal.confirm(
          'Shift has started',
          'This shift has already started, however you have the privileges to add this shift to the schedule. Please confirm you wish to force add the shift to the schedule.',
          signupCallback
        );
        return;

      case 'multiple-enrollment':
        this.modal.open(
          ModalConfirmMultipleEnrollmentComponent,
          {slots: result.slots, person},
          signupCallback
        );

        return;

      case 'missing-requirements':
        this.modal.open(
          ModalConfirmMissingRequirementsComponent,
          {requirements: result.requirements, person},
          signupCallback
        );
        return;

      default:
        this.modal.info(
          'Unknown status response',
          `Sorry, I did not understand the status response of [${result.status}] from the server. This is a BUG and should be reported.`
        );
        break;
    }
  }

  /**
   * Check if the given start and finished datetimes are within the scheduled sign-ups for the given position.
   * Pop up a confirmation model if not.
   *
   * @param position_id
   * @param start
   * @param finished
   * @param callback
   * @returns {Promise<*>}
   */
  async checkDateTime(position_id, start, finished, callback) {
    let status, begins, ends, start_status, finished_status;
    try {
      ({
        status,
        begins,
        ends,
        start_status,
        finished_status
      } = await this.ajax.request('slot/check-datetime', {data: {position_id, start, finished}}));
    } catch (response) {
      this.house.handleErrorResponse(response);
      return;
    }

    if (status === 'no-slots' || status === 'success') {
      //Nothing schedule, Don't alert
      return callback();
    }

    let message = `<p>The date(s) entered are outside of the scheduled sign-up date ranges. This might indicate the dates were entered incorrectly.<ul>`;

    message += this.alertRange('On Duty', start, start_status, begins, ends);
    message += this.alertRange('Off Duty', finished, finished_status, begins, ends);

    message += '</ul> <p class="text-danger">Please note that we do not offer credit for rangering done outside the event period.</p>Use the Cancel button to correct the dates, or use Confirm to indicate the dates are correct.';

    this.modal.confirm('Date(s) might be out of range', message, callback);
  }

  alertRange(label, date, status, begins, ends) {
    if (status === 'success') {
      return '';
    }

    if (status === 'before-begins') {
      return `<li >The ${label} time ${shiftFormat([date], {})} <b class="text-danger">is BEFORE the very first shift of the event</b> starting on ${shiftFormat([begins], {})}.</li>`;
    } else {
      return `<li>The ${label} time ${shiftFormat([date], {})} <b class="text-danger">is AFTER the very last shift of the event</b> ending on ${shiftFormat([ends], {})}.</li>`;
    }
  }

  /**
   * Check if the given start and finished datetimes do not overlap with any timesheet entries.
   *
   * @param {number} person_id
   * @param {string} on_duty
   * @param {string} off_duty
   * @param {number|null} timesheet_id
   * @param {Function} callback
   * @returns {Promise<*>}
   */

  async checkForOverlap(person_id, on_duty, off_duty, timesheet_id, callback) {
    let status, timesheets;
    try {
      const data = {person_id, on_duty, off_duty};
      if (timesheet_id) {
        data.timesheet_id = timesheet_id;
      }
      ({status, timesheets} = await this.ajax.request('timesheet/check-overlap', {data}));
    } catch (response) {
      this.house.handleErrorResponse(response);
      return;
    }

    if (status === 'success') {
      // No overlaps detected
      return callback();
    }

    let message = `<p class="text-danger">The time overlaps with the following timesheet entries:<ul>`;

    timesheets.forEach((entry) => {
      message += `<li>${entry.position.title} ${shiftFormat([entry.on_duty, entry.off_duty], {})}</li>`
    });

    message += '</ul>The entries may not overlap. Double-check the times are correct. Update the status to Correction Rejected if this is a correction request.';

    this.modal.info('Overlapping Timesheet Entries', message);
  }

}
