import {
  validatePresence,
  validateNumber,
  validateFormat
} from 'ember-changeset-validations/validators';

export default {
  title: [
    validatePresence({ presence: true,  message: 'Enter a position title.' }),
  ],

  min: [
    validateNumber({ integer: true, message: 'Enter a number' }),
  ],

  max: [
    validateNumber({ integer: true, message: 'Enter a number' }),
  ],

  contact_email: [
    validateFormat({ type: 'email', allowBlank: true, message: 'Enter a valid email address.' }),
  ],

  sign_out_hour_cap: [
    validateNumber({ gte: 0, allowBlank: true, message: 'Enter zero or a positive number of hours.' }),
  ],
};
