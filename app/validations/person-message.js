import {
  validatePresence,
  validateLength
} from 'ember-changeset-validations/validators';

export default {
  subject: [
    validatePresence(true)
  ],

  body: [
    validatePresence({presence: true, message: 'Enter a message.'}),
    validateLength({min: 5})
  ],
};
