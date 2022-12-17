import Model, {attr} from '@ember-data/model';
import optionsToLabels from 'clubhouse/utils/options-to-labels';

export const POG_SHOWER = 'shower';
export const POG_MEAL = 'meal';
export const POG_HALF_MEAL = 'half-meal';

export const STATUS_ISSUED = 'issued';
export const STATUS_CANCELLED = 'cancelled';
export const STATUS_REDEEMED = 'redeemed';

export const PogOptions = [
  [ 'Full Meal', POG_MEAL ],
  [ '1/2 Meal', POG_HALF_MEAL],
  [ 'Shower', POG_SHOWER]
];

export const PogLabels = optionsToLabels(PogOptions);

export const StatusOptions = [
  [ 'Issued', STATUS_ISSUED],
  [ 'Redeemed', STATUS_REDEEMED],
  [ 'Cancelled', STATUS_CANCELLED]
];

export const StatusLabels = optionsToLabels(StatusOptions);

export default class PersonPogModel extends Model {
  @attr('number') person_id;
  @attr('number') issued_by_id;
  @attr('number') timesheet_id;
  @attr('string', {defaultValue: STATUS_ISSUED}) status;
  @attr('string') pog;
  @attr('string') notes;
  @attr('string', {readOnly: true}) created_at;
  @attr('string', {readOnly: true}) updated_at;

  @attr('') issued_by;
  @attr('') timesheet;

  get pogLabel() {
    return PogLabels[this.pog] ?? this.pog;
  }

  get statusLabel() {
    return StatusLabels[this.status] ?? this.status;
  }
}
