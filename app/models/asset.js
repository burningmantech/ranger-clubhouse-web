import Model, {attr} from '@ember-data/model';

export const TYPE_RADIO = 'radio';
export const TYPE_GEAR = 'gear';
export const TYPE_TEMP_ID = 'temp-id';

// Unused types since 2015.
export const TYPE_VEHICLE = 'vehicle';
export const TYPE_KEY = 'key';
export const TYPE_AMBER = 'amber';

export const TypeLabels = {
  [TYPE_AMBER]: 'Amber',
  [TYPE_GEAR]: 'Gear',
  [TYPE_KEY]: 'Key',
  [TYPE_RADIO]: 'Radio',
  [TYPE_TEMP_ID]: 'Temporary BMID',
  [TYPE_VEHICLE]: 'Vehicle',
};

export default class AssetModel extends Model {
  @attr('string') type;
  @attr('string') barcode;
  @attr('string') description;
  @attr('boolean') perm_assign;

  @attr('string') category;
  @attr('string') notes;

  @attr('number') year;
  @attr('string', {readOnly: true}) created_at;

  get isRadio() {
    return this.type === TYPE_RADIO;
  }

  get isGear() {
    return this.type === TYPE_GEAR;
  }

  get typeLabel() {
    return TypeLabels[this.type] ?? this.type;
  }

  get assignmentLabel() {
    if (this.isRadio) {
      return this.perm_assign ? 'Event' : 'Shift';
    } else {
      return this.perm_assign ? 'Permanent' : 'Temporary';
    }
  }
}
