import {
  validatePresence,
  validateFormat,
  validateLength,
  validateConfirmation
} from 'ember-changeset-validations/validators';
import validateState from 'clubhouse/validators/state';

// Maximum password length. The browser inputs cap at this via @maxlength; the
// validator enforces it so over-long input is rejected rather than silently
// truncated. The API must enforce the same maximum on POST /person/register.
export const PASSWORD_MIN = 5;
export const PASSWORD_MAX = 30;

export const RegisterValidations = {
  intent: [validatePresence(true)],
  human: [validatePresence({presence: true, message: 'Provide an answer.'})],
  first_name: [validatePresence(true)],
  last_name: [validatePresence(true)],
  email: [validatePresence(true), validateFormat({type: 'email'})],
  street1: [validatePresence(true)],
  city: [validatePresence(true)],
  state: [validateState()],
  zip: [validatePresence(true)],
  country: [validatePresence(true)],
  // validateFormat has no `min` option, so the previous validateFormat({min: 9})
  // was a no-op. validateLength enforces the minimum digit count.
  home_phone: [validatePresence(true), validateLength({min: 9})],
  password: [
    validatePresence({presence: true, message: 'Enter the new password.'}),
    validateLength({
      min: PASSWORD_MIN,
      max: PASSWORD_MAX,
      message: `The password must be ${PASSWORD_MIN} to ${PASSWORD_MAX} characters.`
    })
  ],
  password_confirmation: [
    validateConfirmation({on: 'password', message: 'The passwords do not match.'})
  ],
};
