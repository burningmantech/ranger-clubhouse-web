import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {set} from '@ember/object';

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
    set(slot, 'is_submitting', true);

    this.ajax.request(`person/${person.id}/schedule`, {
      method: 'POST',
      data: {slot_id: slot.id, force: (force ? 1 : 0)}
    }).then((result) => {
      set(slot, 'is_submitting', false);
      if (result.status !== 'success') {
        this.handleSignupError(result, slot, person, callback);
        return;
      }

      const isMe = +this.session.userId === +person.id;
      const name = isMe ? "You are" : `${person.callsign}  is`;

      set(slot, 'slot_signed_up', result.signed_up);
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
      set(slot, 'is_submitting', false);
      this.house.handleErrorResponse(response);
    });
  }

  handleSignupError(result, slot, person, callback) {
    const status = result.status;
    const isMe = +this.session.userId === +person.id;

    set(slot, 'slot_signed_up', result.signed_up);

    if (result.may_force) {
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
          'modal-multiple-enrollment', {
            enrolledSlots: result.slots,
            person,
            slot
          });
        break;


      case 'missing-requirements':
        this.modal.open(
          'modal-missing-requirements', {
            requirements: result.requirements,
            person,
            slot
          });
        break;

      default:
        this.modal.info(
          'BUG: Unknown Satus Response',
          `Sorry, I did not understand the status response of [${status}] from the server. This is a BUG and should be reported.`
        );
        break;
    }
  }

  mayForceSignup(result, slot, person, callback) {
    switch (result.status) {
      case 'full':
        this.modal.confirm(
          'Shift is at capacity',
          'The shift is full, however you have the privileges to add this shift to the schedule. Please confirm you wish to force add the shift to the schedule.',
          () => this.slotSignup(slot, person, callback, true)
        );
        return;

      case 'has-started':
        this.modal.confirm(
          'Shift has started',
          'This shift has already started, however you have the privileges to add this shift to the schedule. Please confirm you wish to force add the shift to the schedule.',
          () => this.slotSignup(slot, person, callback, true)
        );
        return;

      case 'multiple-enrollment':
        this.modal.open(
          'modal-confirm-multiple-enrollment',
          {slots: result.slots, person},
          () => this.slotSignup(slot, person, callback, true)
        );

        return;

      case 'missing-requirements':
        this.modal.open(
          'modal-confirm-missing-requirements',
          {requirements: result.requirements, person},
          () => this.slotSignup(slot, person, callback, true)
        );
        return;
      default:
        this.modal.info(
          'Unknown status response',
          `Sorry, I did not understand the status response of [${status}] from the server. This is a BUG and should be reported.`
        );
        break;
    }
  }
}
