import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';

export default {
  identification: [
    validatePresence(true),
    validateFormat({ type: 'email' })
  ],
};
