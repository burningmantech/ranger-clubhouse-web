import Model, {attr} from '@ember-data/model';

export const TYPE_RADIO = 'Radio';
export const TYPE_GEAR = 'Gear';

// Unused types since 2015.
export const TYPE_VEHICLE = 'Vehicle';
export const TYPE_KEY = 'Key';
export const TYPE_AMBER = 'Amber';

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

  @attr('string', {readOnly: true}) create_date;

  get isRadio() {
    return this.description === TYPE_RADIO;
  }

  get isGear() {
    return this.description === TYPE_GEAR;
  }
}
