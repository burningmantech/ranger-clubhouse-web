import DS from 'ember-data';
const { Model } = DS;
import { attr } from '@ember-decorators/data';

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
