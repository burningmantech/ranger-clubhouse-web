import { set } from '@ember/object';

export function slotSignup(controller, slot, person, callback = null, force = false) {
  set(slot, 'is_submitting', true);
  controller.ajax.request(`person/${person.id}/schedule`, {
    method: 'POST',
    data: { slot_id: slot.id, force: (force ? 1 : 0) }
  }).then((result) => {
    set(slot, 'is_submitting', false);
    if (result.status == 'success') {
      const toast = controller.toast;
      const isMe = controller.session.userId == person.id;
      const name = isMe ? "You are" : person.callsign+" is";

      set(slot, 'slot_signed_up', result.signed_up);
      if (result.full_forced) {
        toast.success(`${name} successfully signed up, and the shift is overcapacity. Hope you know what you are doing!`);
      } else if (result.trainer_forced) {
        toast.success(`${name} successfully signed up for the shift, and also signed up for multiple training sessions.`);
      } else if (result.multiple_forced) {
        controller.modal.open('modal-multiple-enrollment', {
          title: 'Sign Up Forced - Other Enrollments Found',
          slots: result.slots,
          person,
          forced: true,
        });
      } else {
        toast.success('Successfully signed up.');
      }

      if (callback) {
        callback(result);
      }
    } else {
      handleSignupError(controller, result, slot, person, callback);
    }
  }).catch((response) => {
    set(slot, 'is_submitting', false);
    controller.house.handleErrorResponse(response);
  });
}

function handleSignupError(controller, result, slot, person, callback) {
  const modal = controller.modal;
  const status = result.status;
  const isMe = controller.session.userId == person.id;

  set(slot, 'slot_signed_up', result.signed_up);

  if (result.may_force) {
    switch (status) {
    case 'full':
      modal.confirm(
        'Shift is at capacity',
        'The shift is full, however you have permission to add this shift to the schedule. Please confirm you wish to force add the shift to the schedule.',
        () => { slotSignup(controller, slot, person, callback, true); }
      );

      return;

    case 'has-started':
      modal.confirm(
        'Shift has started',
        'This shift has already started, however you have permission to add this shift to the schedule. Please confirm you wish to force add the shift to the schedule.',
        () => { slotSignup(controller, slot, person, callback, true); }
      );
      return;
    }
  }

  switch (status) {
  case 'full':
    modal.info('Shift is full', 'Sorry, the shift you wished to sign up for has become full.');
    break;

  case 'no-slot':
    modal.info('Shift not found?', `The shift id=[${slot.id}] was not found in the database. This looks like a bug, please report this!`);
    break;

  case 'no-position':
    modal.info('Position not held', `${isMe ? "You must have" : person.callsign+" needs"} the position "${result.position_title}" in order to sign up for this shift.`);
    break;

  case 'exists':
    modal.info('Already signed up', `${isMe ? "You are" : person.callsign+" is"} already signed up for this shift.`);
    break;

  case 'not-active':
    modal.info('Inactive Shift', 'Sign ups are not allowed because the shift has not been activated. Please check back later and try again.');
    break;

  case 'multiple-enrollment':
    modal.open(
      'modal-multiple-enrollment', {
        title: 'Multiple Enrollments Not Allowed',
        slots: result.slots,
        person
      });
    break;

  default:
    modal.info('Unknown status response', `Sorry, I did not understand the status response of [${status}] from the server. This is a BUG and should be reported.`);
    break;
  }
}
