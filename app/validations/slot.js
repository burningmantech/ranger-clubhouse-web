import {
  validatePresence,
  validateNumber
} from 'ember-changeset-validations/validators';

import validateDateTime from 'clubhouse/validators/datetime';

export default {
  description: [
    validatePresence({ presence: true,  message: 'Enter a description.' }),
  ],

  begins: [
    validatePresence({ presence: true,  message: 'Enter a date and time.' }),
    validateDateTime({ before: 'ends' })
  ],

  ends: [
    validatePresence({ presence: true,  message: 'Enter a date and time.' }),
    validateDateTime({ after: 'begins' })
  ],

  position_id: [
    validatePresence({ presence: true,  message: 'Select a position.' }),
  ],

  max: [
    validateNumber({ integer: true, message: 'Enter a number' }),
  ],

};
