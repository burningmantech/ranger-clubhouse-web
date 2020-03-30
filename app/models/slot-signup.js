import Model, { attr } from '@ember-data/model';

export default class SlotSignupModel extends Model {
  @attr('number') person_id;
  @attr('string') callsign;
  @attr('number') position_id;
  @attr('string') position_title;
}
