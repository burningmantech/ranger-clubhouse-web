/*
 * Manage a person's Alert Preferences - used by me/alerts, and person/N/alerts
 */

import Component from '@glimmer/component';
import {action} from '@ember/object';
import {validateFormat} from 'ember-changeset-validations/validators';
import {isEmpty} from '@ember/utils';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

const PHONE_REGEXP = /^\+?((?:9[679]|8[035789]|6[789]|5[90]|42|3[578]|2[1-689])|9[0-58]|8[1246]|6[0-6]|5[1-8]|4[013-9]|3[0-469]|2[70]|7|1?)(?:\W*\d){0,13}\d$/;


class Phone {
  @tracked phone;
  @tracked is_stopped;
  @tracked is_verified;

  constructor(info) {
    this.phone = info.phone;
    this.is_stopped = info.is_stopped;
    this.is_verified = info.is_verified;
  }
}

class PhoneNumbers {
  @tracked is_same;
  @tracked off_playa;
  @tracked on_playa;

  constructor(sms) {
    this.is_same = sms.is_same;
    this.off_playa = new Phone(sms.off_playa);
    this.on_playa = new Phone(sms.on_playa);
  }
}

export default class AlertsManageComponent extends Component {
  @service toast;
  @service ajax;
  @service modal;
  @service house;
  @service session;

  @tracked isSubmitting = false;

  @tracked numbers = null;

  // Phone numbers to use

  // Verification form - user enters verification codes here.
  verifyForm = {
    on_playa: '',
    off_playa: '',
    is_same: false,
  };

  numberValidations = {
    on_playa: [validateFormat({regex: PHONE_REGEXP, allowBlank: true})],
    off_playa: [validateFormat({regex: PHONE_REGEXP, allowBlank: true})],
  }

  constructor() {
    super(...arguments);
    const {numbers, alerts} = this.args;

    this.phoneForm = {
      on_playa: numbers.on_playa.phone,
      off_playa: numbers.off_playa.phone,
      is_same: numbers.is_same
    };

    this.isMe = (this.args.person.id == this.session.userId);

    this.onPlayaAlerts = alerts.filter((a) => a.on_playa);
    this.offPlayaAlerts = alerts.filter((a) => !a.on_playa);

    this.numbers = new PhoneNumbers(numbers);
  }


  // Are one or both numbers stopped?
  get isStopped() {
    const numbers = this.numbers;

    return (numbers.off_playa.is_stopped || numbers.on_playa.is_stopped);
  }

  // One or both numbers not verified?
  get notVerified() {
    const numbers = this.numbers;

    return ((!isEmpty(numbers.off_playa.phone) && !numbers.off_playa.is_verified)
      || (!isEmpty(numbers.on_playa.phone) && !numbers.on_playa.is_verified));
  }

  // List which numbers are not verified.
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

    if (which === 'off-playa') {
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
          this.numbers = new PhoneNumbers(result.numbers);
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
  async saveNumbersAction(model) {
    if (model.is_same) {
      model.on_playa = model.off_playa;
      // Re-run the validation
      await model.validate();
    }

    if (!isEmpty(model.errors)) {
      // numbers are not valid.
      return;
    }

    const off_playa = model.off_playa;
    let on_playa = model.on_playa;

    this.isSubmitting = true;
    try {
      const {numbers} = await this.ajax.request(`sms`, {
        method: 'POST',
        data: {
          person_id: this.args.person.id,
          on_playa,
          off_playa
        }
      });

      // Update the form with the current values
      model.off_playa = numbers.off_playa.phone;
      model.on_playa = numbers.on_playa.phone;
      model.is_same = numbers.is_same;
      this.numbers = new PhoneNumbers(numbers);

      if (numbers.on_playa.code_status === 'sent-fail'
        || numbers.off_playa.code_status === 'sent-fail') {
        this.toast.error(`The phone number(s) were updated except a verification code could not be sent at this time.`);
      } else {
        this.toast.success('The phone number(s) have been successfully updated.');
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  // Send new verification codes
  @action
  async sendNewCodeAction(type) {
    const person_id = this.args.person.id;

    this.isSubmitting = true;
    try {
      const {status} = await this.ajax.request('sms/send-code', {method: 'POST', data: {person_id, type}});
      switch (status) {
        case 'sent':
          this.toast.success('A NEW verification code has been sent.');
          break;

        case 'already-verified':
          this.toast.warning('Phone number is already verified.');
          break;

        default:
          this.toast.error(`The response status [${status}] from the server was not understood.`);
          break;
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false
    }
  }
}
