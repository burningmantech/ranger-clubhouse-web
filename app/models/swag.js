import Model, {attr} from '@ember-data/model';
import optionsToLabels from 'clubhouse/utils/options-to-labels';

export const TYPE_DEPT_PATCH = 'dept-patch';
export const TYPE_DEPT_PIN = 'dept-pin';
export const TYPE_DEPT_SHIRT = 'dept-shirt';
export const TYPE_ORG_PATCH = 'org-patch';
export const TYPE_ORG_PIN = 'org-pin';
export const TYPE_OTHER = 'other';

export const SHIRT_T_SHIRT = 't-shirt';
export const SHIRT_LONG_SLEEVE = 'long-sleeve';

export const TypeOptions = [
  ['Ranger Patch', TYPE_DEPT_PATCH],
  ['Ranger Pin', TYPE_DEPT_PIN],
  ['Ranger Shirt', TYPE_DEPT_SHIRT],
  ['Org Patch', TYPE_ORG_PATCH],
  ['Org Pin', TYPE_ORG_PIN],
  ['Other', TYPE_OTHER],
];
export const TypeLabels = optionsToLabels(TypeOptions);

export const ShirtTypeOptions = [
  ['Select Shirt', ''],
  ['T-Shirt', SHIRT_T_SHIRT],
  ['Long Sleeve', SHIRT_LONG_SLEEVE]
];
export const ShirtTypeLabels = optionsToLabels(ShirtTypeOptions);

export default class SwagModel extends Model {
  @attr('string') title;
  @attr('string', {defaultValue: TYPE_DEPT_PIN}) type;
  @attr('string') description;
  @attr('string') shirt_type;
  @attr('boolean', {defaultValue: true}) active;

  get typeLabel() {
    return TypeLabels[this.type] ?? this.type;
  }

  get shirtTypeLabel() {
    return ShirtTypeLabels[this.shirt_type] ?? this.shirt_type;
  }
}
