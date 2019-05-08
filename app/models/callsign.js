import DS from 'ember-data';
const { attr } = DS;

export default class CallsignModel extends DS.Model {
  @attr('string') callsign;
  @attr('string') status;
}
