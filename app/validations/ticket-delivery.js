import { validatePresence } from 'ember-changeset-validations/validators';

const ifMail = function(message) {
  const validator = validatePresence({ presence: true, message: message});

  return function(key, newValue, oldValue, changes, content) {
    const method = (changes.hasOwnProperty('method') ? changes.method : content.get('method'));

    if (method == 'mail') {
      return validator(...arguments);
    }
    return true;
  }
};

export default {
  street: [
    ifMail('Enter a street address.')
  ],

  city: [
    ifMail('Enter a city')
  ],

  state: [
    ifMail('Enter a state or province name.')
  ],

  postal_code: [
    ifMail('Enter a zip or postal code.')
  ]
};

/*
street: [
  validatePresence({ presence: true,  message: "Enter a street address." }),
],

city: [
  validatePresence({ presence: true,  message: 'Enter a city' }),
],

state: [
  validatePresence({ presence: true,  message: 'Enter a state or province name.'}),
],

postal_code: [
  validateFormat({ type: 'email', message: 'Enter a zip or postal code.' })
]
*/
