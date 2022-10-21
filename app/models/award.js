import Model, {attr} from '@ember-data/model';
import {htmlSafe} from '@ember/template';

// Year round contribution (cadre membership, extraordinary work, etc.)
export const TYPE_YEAR_ROUND = 'year-round';

// Special event award such as Operation Non Event
export const TYPE_SPECIAL_EVENT = 'special-event';

// Playa service
export const TYPE_PLAYA_SERVICE = 'playa-service';

export const TypeOptions = [
  ['Playa Service', TYPE_PLAYA_SERVICE],
  ['Year Round Contributions', TYPE_YEAR_ROUND],
  ['Special Events', TYPE_SPECIAL_EVENT],
];

export const TypeLabels = TypeOptions.reduce((hash, opt) => {
  hash[opt[1]] = opt[0];
  return hash
}, {})

export const TypeSortOrder = {
  [TYPE_PLAYA_SERVICE]: 1,
  [TYPE_YEAR_ROUND]: 2,
  [TYPE_SPECIAL_EVENT]: 3,
}
// Font Awesome icons
export const Icons = [
  'award', 'certificate', 'star', 'medal', 'trophy',
];

export const IconOptions = Icons.map((icon) => [htmlSafe(`<i class="fas fa-${icon}"></i>`), icon]);

export default class AwardModel extends Model {
  @attr('string') title;
  @attr('string', {defaultValue: TYPE_PLAYA_SERVICE}) type;
  @attr('string', {defaultValue: 'award'}) icon;
  @attr('string') description;

  get typeLabel() {
    return TypeLabels[this.type] ?? this.type;
  }
}
