import DS from 'ember-data';
const { attr } = DS;

export default class AccessDocumentDelivery extends DS.Model {
  @attr('number') person_id;
  @attr('string', { defaultValue: 'will_call'}) method;
  @attr('number') year;

  @attr('string') street;
  @attr('string') city;
  @attr('string') state;
  @attr('string', { defaultValue: 'United States'}) country;
  @attr('string') postal_code;
}
