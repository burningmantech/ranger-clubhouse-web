import {
  validatePresence,
  validateLength,
  validateFormat,
} from 'ember-changeset-validations/validators';

export default {
  identification: [
    validatePresence({ presence: true, message: 'Enter your email address.'}),
    validateFormat({ type: 'email', message: 'Enter a validate email address.' })
  ],
  password: [
    validatePresence(true),
    validateLength({ min: 3, max: 40 })
  ]
};
