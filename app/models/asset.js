import DS from 'ember-data';
const { Model } = DS;
import { attr } from '@ember-decorators/data';

export default class AssetModel extends Model {
  @attr('string') description;
  @attr('string') barcode;
  @attr('string') temp_id;
  @attr('boolean') perm_assign;

  // Vehicle field - not used since the 2015 event.
  @attr('string') subtype;
  @attr('string') model;
  @attr('string') color;
  @attr('string') style;
  @attr('string') category;
  @attr('string') notes;

  @attr('string', { readOnly: true }) create_date;
}
