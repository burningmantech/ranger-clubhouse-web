import Model, { attr } from '@ember-data/model';

export const TYPE_FLEET = 'fleet';
export const TYPE_PERSONAL = 'personal';

export const STATUS_PENDING = 'pending';
export const STATUS_APPROVED = 'approved';
export const STATUS_REJECTED = 'rejected';

export const AmberLightLabels = {
  none: '-',
  'already-has': 'Personal',
  'department': 'Department'
};

export const DrivingStickerLabels = {
  none: '-',
  staff: 'Staff',
  prepost: 'Pre/Post',
  other: 'Other'
};

export const FuelChitLabels = {
  none: '-',
  'single-use': 'Single Use',
  event: 'Event'
};

export const RangerLogoLabels = {
  none: '-',
  'permanent-new': 'Permanent New',
  'permanent-existing': 'Permanent Reauthorized',
  event: 'Event Only'
};

export default class VehicleModel extends Model {

  @attr('number') person_id;
  @attr('') person;

  @attr('number') event_year;
  @attr('string') type;     // Vehicle Type Personal or Fleet
  @attr('string', { defaultValue: STATUS_PENDING}) status;
  @attr('string', { defaultValue: '' }) team_assignment;

  @attr('string') vehicle_year; // might be numeric year or 'TBA' string.
  @attr('string') vehicle_class;
  @attr('string') vehicle_make;
  @attr('string') vehicle_model;
  @attr('string') vehicle_color;
  @attr('string', {defaultValue: ''}) license_number;
  @attr('string', {defaultValue: 'CA'}) license_state;
  @attr('string', { defaultValue: 'prepost'}) driving_sticker;
  @attr('string', {defaultValue: ''}) rental_number;
  @attr('string', {defaultValue: ''}) sticker_number;
  @attr('string', {defaultValue: 'none'}) fuel_chit;
  @attr('string', {defaultValue: 'none'}) ranger_logo;
  @attr('string', {defaultValue: 'none'}) amber_light;
  @attr('string', { defaultValue: ''}) notes;
  @attr('string', { defaultValue: ''}) response;
  @attr('string', { defaultValue: ''}) request_comment;


  // Pseudo fields - only related to Personal vehicles.
  @attr('boolean', { readOnly: true }) org_vehicle_insurance;
  @attr('boolean', { readOnly: true }) signed_motorpool_agreement;
  @attr('boolean', { readOnly: true }) signed_personal_vehicle_agreement;
  @attr('string') callsign; // only used for creation or update

  get isApproved() {
    return this.status === STATUS_APPROVED;
  }

  get isRejected() {
    return this.status === STATUS_REJECTED;
  }

  get isPending() {
    return this.status === STATUS_PENDING;
  }

  get isPersonal() {
    return this.type === TYPE_PERSONAL;
  }

  get isFleet() {
    return this.type === TYPE_FLEET;
  }

  get amberLightLabel() {
    return AmberLightLabels[this.amber_light] ?? this.amber_light;
  }

  get drivingStickerLabel(){
    return DrivingStickerLabels[this.driving_sticker] ?? this.driving_sticker;
  }

  get fuelChitLabel() {
    return FuelChitLabels[this.fuel_chit] ?? this.fuel_chit;
  }

  get rangerLogoLabel() {
    return RangerLogoLabels[this.ranger_logo] ?? this.ranger_logo;
  }
}
