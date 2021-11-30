import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {
  validatePresence,
  validateFormat,
  validateLength,
  validateConfirmation
} from 'ember-changeset-validations/validators';
import validateState from 'clubhouse/validators/state';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

const HUMAN_ANSWER = 35;

export default class RegisterController extends ClubhouseController {
  @tracked isSaving = false;
  @tracked step;

  intentOptions = [
    ["I am (or intend to become) a Regional Ranger but do not intend to become a Black Rock Ranger at Burning Man this year", "Regional"],
    ["I want to sit in on your training but don't intend to become a Black Rock Ranger this year", "Sitin"],
    ["I intend to become a Black Rock Ranger at Burning Man this year", "Ranger"],
    ["I have some other nefarious purpose in mind", "Other"]
  ];

  registerValidations = {
    intent: [validatePresence(true)],
    human: [validatePresence({presence: true, message: 'Provide an answer.'})],
    first_name: [validatePresence(true)],
    last_name: [validatePresence(true)],
    email: [validatePresence(true), validateFormat({type: 'email'})],
    street1: [validatePresence(true)],
    city: [validatePresence(true)],
    state: [validateState()],
    zip: [validatePresence(true)],
    country: [validatePresence(true)],
    home_phone: [validatePresence(true), validateFormat({min: 9})],
    password: [
      validatePresence({presence: true, message: 'Enter the new password.'}),
      validateLength({min: 5, message: 'The password should be 5 characters or more.'})
    ],
    password_confirmation: [
      validateConfirmation({on: 'password', message: 'The password do not match.'})
    ],

  };

  // Fields passed to the backend ('human' & 'password_confirmation' excluded.)
  fields = [
    'email',
    'first_name',
    'mi',
    'last_name',
    'street1',
    'street2',
    'apt',
    'city',
    'state',
    'country',
    'zip',
    'password',
    'home_phone',
    'alt_phone',
  ];

  @action
  createAccount(model, isValid) {
    if (!isValid) {
      return;
    }

    const humanAnswer = model.human.trim();

    if (humanAnswer != HUMAN_ANSWER) {
      model.pushErrors('human', 'Are you sure you are human? The answer is not right. Try again.');
      this.house.scrollToTop();
      return;
    }

    const person = {status: 'auditor'};
    const intent = model.intent;

    this.fields.forEach((field) => {
      person[field] = model.get(field)
    });

    this.isSaving = true;
    this.ajax.request(`person/register`, {
      method: 'POST',
      data: {person, intent},
    }).then((result) => {
      switch (result.status) {
        case 'success':
          this.modal.info('Account Successfully Created', 'Congratulations Auditor! You have successfully created a Clubhouse account. After closing this dialog, you will be redirected the login. Go ahead and login.', () => {
            this.router.transitionTo('login');
          });
          break;

        default:
          this.toast.error(`Unknown response received from the server [${result.status}]`);
          break;
      }
    }).catch((response) => this.house.handleErrorResponse(response, model))
      .finally(() => this.isSaving = false);
  }

  @action
  stepAction(step) {
    this.step = step;
  }
}
