import Model, { attr } from '@ember-data/model';

export default class AccessDocumentDelivery extends Model {
  @attr('number') person_id;
  @attr('string', { defaultValue: 'will_call'}) method;
  @attr('number') year;

  @attr('string') street;
  @attr('string') city;
  @attr('string') state;
  @attr('string', { defaultValue: 'United States'}) country;
  @attr('string') postal_code;
}
