import DS from 'ember-data';
import { attr } from '@ember-decorators/data';

export default class CallsignModel extends DS.Model {
  @attr('string') callsign;
  @attr('string') status;
}
