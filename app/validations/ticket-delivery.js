import { validatePresence } from 'ember-changeset-validations/validators';

export default {
  street: [
    validatePresence({
      presence: true,
      message: "Enter a street address."
    }),
  ],

  city: [
    validatePresence({
      presence: true,
      message: 'Enter a city'
    }),
  ],

  state: [
    validatePresence({
      presence: true,
      message: 'Enter a state or province name.'
    }),
  ],

  postal_code: [
    validatePresence({
      presence: true,
      message: 'Enter a zip or postal code.'
    })
  ]
};
