import DS from 'ember-data';
const { attr } = DS;

export default class SlotSignupModel extends DS.Model {
  @attr('number') person_id;
  @attr('string') callsign;
  @attr('number') position_id;
  @attr('string') position_title;
}
