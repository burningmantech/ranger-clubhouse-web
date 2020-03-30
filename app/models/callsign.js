import Model, { attr } from '@ember-data/model';

export default class CallsignModel extends Model {
  @attr('string') callsign;
  @attr('string') status;
}
