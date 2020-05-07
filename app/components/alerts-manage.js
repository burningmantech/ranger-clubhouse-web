/*
 * Manage a person's Alert Preferences - used by me/alerts, and person/N/alerts
 */

import Component from '@glimmer/component';
import EmberObject, {action, computed} from '@ember/object';
import {filterBy} from '@ember/object/computed';
import {validateFormat} from 'ember-changeset-validations/validators';
import {isEmpty} from '@ember/utils';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';

const PHONE_REGEXP = /^(?=(?:\D*\d){10,15}\D*$)\+?[0-9]{1,3}[\s-]?(?:\(0?[0-9]{1,5}\)|[0-9]{1,5})[-\s]?[0-9][\d\s-]{5,7}\s?(?:x[\d-]{0,4})?$/;

export default class AlertsManageComponent extends Component {
  @service toast;
  @service ajax;
  @service modal;
  @service house;
  @service session;

  @tracked isSubmitting = false;
  @tracked isUpdatingNumbers = false;

  @tracked numbers = null;

  // Phone numbers to use

  // Verification form - user enters verification codes here.
  verifyForm = EmberObject.create({
    on_playa: '',
    off_playa: '',
    is_same: false,
  });

  numberValidations = {
    on_playa: [validateFormat({regex: PHONE_REGEXP, allowBlank: true})],
    off_playa: [validateFormat({regex: PHONE_REGEXP, allowBlank: true})],
  }

  // Sort alert prefs into on playa and off playa groups for display.
  @filterBy('args.alerts', 'on_playa', true) onPlayaAlerts;
  @filterBy('args.alerts', 'on_playa', false) offPlayaAlerts;

  constructor() {
    super(...arguments);
    const numbers = this.args.numbers;

    this.phoneForm = EmberObject.create({
      on_playa: numbers.on_playa.phone,
      off_playa: numbers.off_playa.phone,
      is_same: numbers.is_same
    });

    this.numbers = numbers;
  }

  get isMe() {
    return this.args.person.id == this.session.userId;
  }

  // Are one or both numbers stopped?
  @computed('numbers.{off_playa,on_playa}.is_stopped')
  get isStopped() {
    const numbers = this.numbers;

    return (numbers.off_playa.is_stopped || numbers.on_playa.is_stopped);
  }

  // One or both numbers not verified?
  @computed('numbers.{off_playa,on_playa}.is_verified')
  get notVerified() {
    const numbers = this.numbers;

    return ((!isEmpty(numbers.off_playa.phone) && !numbers.off_playa.is_verified)
      || (!isEmpty(numbers.on_playa.phone) && !numbers.on_playa.is_verified));
  }

  // List which numbers are not verified.
  @computed('numbers.{off_playa,on_playa}.is_verified')
  get unverifiedPhones() {
    const phones = [];
    const numbers = this.numbers;

    if (!isEmpty(numbers.on_playa.phone) && !numbers.on_playa.is_verified) {
      phones.push(numbers.on_playa.phone);
    }

    if (!isEmpty(numbers.off_playa.phone) && !numbers.off_playa.is_verified && !numbers.is_same) {
      phones.push(numbers.off_playa.phone);
    }

    return phones.join(' and ');
  }

  // Update the user preferences
  @action
  updatePrefsAction() {
    const alerts = this.args.alerts.map((alert) => {
      return {
        id: alert.id,
        use_sms: alert.use_sms ? 1 : 0,
        use_email: alert.use_email ? 1 : 0,
      }
    });

    this.isSubmitting = true;
    this.ajax.request(`person/${this.args.person.id}/alerts`, {
      method: 'PATCH',
      data: {alerts}
    }).then(() => {
      this.toast.success('The alert preferences have been successfully updated.')
    })
      .catch((response) => {
        this.house.handleErrorResponse(response)
      })
      .finally(() => this.isSubmitting = false);
  }

  // Confirm a phone number as verified.
  @action
  confirmCodeAction(model, which) {
    const personId = this.args.person.id;
    const numbers = this.numbers;

    let code, type, phone;

    if (which == 'off-playa') {
      code = model.off_playa;
      type = 'off-playa';
      phone = numbers.off_playa.phone;
    } else {
      code = model.on_playa;
      type = 'on-playa';
      phone = numbers.on_playa.phone;
    }

    this.isSubmitting = true;
    this.ajax.request('sms/confirm-code', {
      method: 'POST',
      data: {
        type,
        code,
        person_id: personId
      }
    }).then((result) => {
      switch (result.status) {
        case 'confirmed':
          this.toast.success(`Phone number has been been confirmed. Thank you.`);
          this.numbers = result.numbers;
          break;

        case 'already-verified':
          this.modal.info(null, `${phone} has already been verified. There is nothing else to do.`);
          break;

        case 'no-match':
          this.modal.info(null, `Sorry, the verification code entered for ${phone} does not match.`);
          break;

        default:
          this.toast.error(`The response status [${result.status}] from the server was not understood.`);
          break;
      }
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  // Save the phone numbers entered.
  @action
  saveNumbersAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const off_playa = model.off_playa;
    let on_playa = model.on_playa;

    if (model.is_same) {
      on_playa = off_playa;
    }

    this.isUpdatingNumbers = true;
    this.ajax.request(`sms`, {
      method: 'POST',
      data: {
        person_id: this.args.person.id,
        on_playa,
        off_playa
      }
    }).then((result) => {
      const numbers = result.numbers;

      // Update the form with the current values
      model.off_playa = numbers.off_playa.phone;
      model.on_playa = numbers.on_playa.phone;
      model.is_same = numbers.is_same;
      this.numbers = numbers;

      if (numbers.on_playa.code_status == 'sent-fail' || numbers.off_playa.code_status == 'sent-fail') {
        this.toast.error(`The phone number(s) were updated except a verification code could not be sent at this time.`);
      } else {
        this.toast.success('The phone number(s) have been successfully updated.');
      }
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    }).finally(() => {
      this.isUpdatingNumbers = false;
    });
  }

  // Send new verification codes
  @action
  sendNewCodeAction(type) {
    const person_id = this.args.person.id;

    this.isSubmitting = true;
    this.ajax.request('sms/send-code', {method: 'POST', data: {person_id, type}})
      .then((result) => {
        switch (result.status) {
          case 'sent':
            this.toast.success('A NEW verification code has been sent.');
            break;

          case 'already-verified':
            this.toast.warning('Phone number is already verified.');
            break;

          default:
            this.toast.error(`The response status [${result.status}] from the server was not understood.`);
            break;
        }
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }
}
