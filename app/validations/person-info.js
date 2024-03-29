import {
  validatePresence,  validateFormat
} from 'ember-changeset-validations/validators';
import validateState from 'clubhouse/validators/state';
import validateCustom from 'clubhouse/validators/custom';

export const REQUIRED_PII_VALIDATIONS = {
  first_name: [
    validatePresence(true)
  ],

  last_name: [
    validatePresence(true),
  ],

  email: [
    validateFormat({ type: 'email' })
  ],
};

export default {
  ...REQUIRED_PII_VALIDATIONS,
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
  ],

  pronouns_custom: [
    validateCustom({ field: 'pronouns' })
  ]
};
