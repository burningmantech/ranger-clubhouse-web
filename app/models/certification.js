import Model, { attr } from '@ember-data/model';

export default class CertificationModel extends Model {
  @attr('string') title;
  @attr('boolean', {defaultValue: false}) is_lifetime_certification;
  @attr('boolean', {defaultValue: false}) on_sl_report;
  @attr('string') sl_title;
  @attr('string') description;

  @attr('number', { readOnly: true }) total_people;
}
