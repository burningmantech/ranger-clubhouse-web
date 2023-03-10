import Model, { attr } from '@ember-data/model';

export default class AssetPersonModel extends Model {
  @attr('number') person_id;
  @attr('number') asset_id;
  @attr('shiftdate') checked_out;
  @attr('shiftdate') checked_in;
  @attr('number') attachment_id;
  @attr('number') check_out_person_id;
  @attr('number') check_in_person_id;

  @attr('', { readOnly: true }) asset;
  @attr('', { readOnly: true }) attachment;
  @attr('', { readOnly: true }) person;
  @attr('', { readOnly: true }) check_out_person;
  @attr('', { readOnly: true }) check_in_person;
}
