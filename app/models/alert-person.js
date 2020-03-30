import Model, { attr } from '@ember-data/model';

export default class AlertModel extends Model {
  @attr('number') person_id;
  @attr('boolean') use_sms;
  @attr('boolean') use_email;

  @attr('string', { readOnly: true}) title;
  @attr('string', { readOnly: true}) description;
  @attr('boolean', { readOnly: true}) on_playa;
}
