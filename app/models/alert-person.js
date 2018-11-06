import DS from 'ember-data';
import { attr } from '@ember-decorators/data';

export default class AlertModel extends DS.Model {
  @attr('number') person_id;
  @attr('boolean') use_sms;
  @attr('boolean') use_email;

  @attr('string', { readOnly: true}) title;
  @attr('string', { readOnly: true}) description;
  @attr('boolean', { readOnly: true}) on_playa;
}
