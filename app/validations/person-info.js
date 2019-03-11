import {
  validatePresence,  validateFormat
} from 'ember-changeset-validations/validators';
import validateState from 'clubhouse/validators/state';

export default {
  first_name: [
    validatePresence(true)
  ],

  last_name: [
    validatePresence(true),
  ],

  email: [
    validateFormat({ type: 'email' })
  ],

  street1: [
    validatePresence(true),
  ],

  country: [
    validatePresence(true),
  ],

  city: [
    validatePresence(true),
  ],

  state: [
    validateState(),
  ],

  zip: [
    validatePresence(true),
  ],

  home_phone: [
    validatePresence(true),
    validateFormat({ min: 9 })
  ]
};
