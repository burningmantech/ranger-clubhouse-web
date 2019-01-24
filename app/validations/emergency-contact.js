import {
//  validatePresence,
  validateFormat
} from 'ember-changeset-validations/validators';

export default {
/*

  Allow any field to be set or note..
  em_first_name: [
    validatePresence({ presence: true,  message: "Enter a First Name" }),
  ],

  em_last_name: [
    validatePresence({ presence: true,  message: 'Enter a Last Name' }),
  ],

  em_home_phone: [
    validatePresence({ presence: true,  message: 'Enter a home phone number'}),
  ],
*/
  em_email: [
    validateFormat({ allowBlank: true,  type: 'email', message: 'Enter an email address' })
  ],

/*
  em_camp_location: [
    validatePresence({ presence: true,  message: 'Enter a camp location'}),
  ],*/
};
