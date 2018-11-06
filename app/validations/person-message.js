import {
  validatePresence,
  validateLength
} from 'ember-changeset-validations/validators';

export default {
  message_from: [
    validatePresence({ presence: true, message: "Enter the Ranger or team this message is from."}),
    validateLength({ min: 2 })
  ],

  recipient_callsign: [
    validatePresence({ presence: true, message: "Enter the ranger's callsign."}),
    validateLength({ min: 2 })
  ],

  subject: [
    validatePresence(true)
  ],

  body: [
    validatePresence({ presence: true, message: 'Enter a message.'}),
    validateLength({ min: 5 })
  ],

};
