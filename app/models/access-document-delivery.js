import Model, { attr } from '@ember-data/model';
import { isEmpty } from '@ember/utils';

export const DELIVERY_MAIL = 'mail';
export const DELIVERY_WILL_CALL = 'will_call';
export const DELIVERY_NONE = 'none';

export default class AccessDocumentDelivery extends Model {
  @attr('number') person_id;
  @attr('number') year;

  @attr('string', { defaultValue: DELIVERY_NONE}) method;

  @attr('string') street;
  @attr('string') city;
  @attr('string') state;
  @attr('string', { defaultValue: 'United States'}) country;
  @attr('string') postal_code;


  get isDeliveryPostal() {
    return this.method === DELIVERY_MAIL;
  }

  get isDeliveryWillCall() {
    return this.method === DELIVERY_WILL_CALL;
  }

  get isDeliveryNone() {
    return this.method === DELIVERY_NONE || isEmpty(this.method);
  }

  get haveAddress() {
    if (this.method === DELIVERY_WILL_CALL) {
      return true;
    }

    if (this.method === DELIVERY_NONE || isEmpty(this.method)) {
      return false;
    }

    for (const name of [ 'street', 'city', 'state', 'postal_code']) {
      if (isEmpty(this[name])) {
        return false
      }
    }

    return true;
  }
}
