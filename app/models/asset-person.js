import DS from 'ember-data';
const { Model } = DS;
const { attr } = DS;

export default class AssetPersonModel extends Model {
  @attr('number') person_id;
  @attr('number') asset_id;
  @attr('shiftdate') checked_out;
  @attr('shiftdate') checked_in;
  @attr('number') attachment_id;

  @attr('', { readOnly: true }) asset;
  @attr('', { readOnly: true }) attachment;
  @attr('', { readOnly: true }) person;
}
