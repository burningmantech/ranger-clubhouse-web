import {
  validatePresence,
  validateNumber
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

};
