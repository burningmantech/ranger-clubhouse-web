import Model, {attr} from '@ember-data/model';

export const TYPE_RADIO = 'radio';
export const TYPE_GEAR = 'gear';
export const TYPE_TEMP_ID = 'temp-id';

// Unused types since 2015.
export const TYPE_VEHICLE = 'vehicle';
export const TYPE_KEY = 'key';
export const TYPE_AMBER = 'amber';

export const TYPE_DESKTOP_RADIO = 'desktop-radio';
export const TYPE_MOBILE_RADIO = 'mobile-radio';
export const TYPE_RADIO_CHARGER = 'radio-charger';

export const TypeLabels = {
  [TYPE_AMBER]: 'Amber',
  [TYPE_DESKTOP_RADIO]: 'Desktop Radio',
  [TYPE_GEAR]: 'Gear',
  [TYPE_KEY]: 'Key',
  [TYPE_MOBILE_RADIO]: 'Mobile Radio',
  [TYPE_RADIO]: 'Radio',
  [TYPE_RADIO_CHARGER]: 'Radio Charger',
  [TYPE_TEMP_ID]: 'Temporary BMID',
  [TYPE_VEHICLE]: 'Vehicle',
};

export const TypeSort = {
  [TYPE_RADIO]: 1,
  [TYPE_DESKTOP_RADIO]: 2,
  [TYPE_MOBILE_RADIO]: 3,
  [TYPE_RADIO_CHARGER]: 4,
  [TYPE_TEMP_ID]: 5,
  [TYPE_GEAR]: 6,
  [TYPE_VEHICLE]:  7,
  [TYPE_AMBER]: 8,
  [TYPE_KEY]: 9,
}

export default class AssetModel extends Model {
  @attr('string') type;
  @attr('string') barcode;
  @attr('string') description;
  @attr('boolean') perm_assign;

  @attr('string') notes;

  @attr('string') entity_assignment;
  @attr('string') group_name;
  @attr('string') order_number;

  @attr('number') year;
  @attr('string', {readOnly: true}) created_at;

  @attr('string') expires_on;
  @attr('boolean', {readOnly: true}) has_expired;

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
