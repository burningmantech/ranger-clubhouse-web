import DS from 'ember-data';
import { attr } from '@ember-decorators/data';

export default class SlotSignupModel extends DS.Model {
  @attr('number') person_id;
  @attr('string') callsign;
  @attr('number') position_id;
  @attr('string') position_title;
}
