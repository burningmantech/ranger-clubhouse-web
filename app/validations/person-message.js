import {
  validatePresence,
  validateLength
} from 'ember-changeset-validations/validators';

const body = [
  validatePresence({presence: true, message: 'Enter a message.'}),
  validateLength({min: 5, message: 'Your message must be at least 5 characters.'})
];

// Replies have no subject (it is inherited from the parent), so they validate the body only.
export const PersonMessageReplyValidations = {
  body,
};

// New messages require a subject and a body.
export default {
  subject: [
    validatePresence({presence: true, message: 'Enter a subject.'})
  ],

  body,
};
