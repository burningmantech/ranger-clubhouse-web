import Model, { attr } from '@ember-data/model';

export default class PersonEventModel extends Model {
  @attr('number', { readOnly: true }) person_id;
  @attr('number', { readOnly: true }) year;

  @attr('boolean', { defaultValue: false }) may_request_stickers;
  @attr('boolean', { defaultValue: false }) org_vehicle_insurance;
  @attr('boolean', { defaultValue: false }) signed_motorpool_agreement;
  @attr('boolean', { defaultValue: false }) signed_personal_vehicle_agreement;

  @attr('boolean', { defaultValue: false }) asset_authorized;
  @attr('boolean', { defaultValue: false }) sandman_affidavit;

  @attr('boolean') timesheet_confirmed;

  @attr('string', { readOnly: true }) timesheet_confirmed_at;
}
