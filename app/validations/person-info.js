import {
  validatePresence,  validateFormat
} from 'ember-changeset-validations/validators';

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


  city: [
    validatePresence(true),
  ],
  state: [
    validatePresence(true),
  ],
  zip: [
    validatePresence(true),
  ],
  country: [
    validatePresence(true),
  ],
  home_phone: [
    validatePresence(true),
    validateFormat({ min: 9 })
  ]
};
