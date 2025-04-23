import Component from '@glimmer/component';
import {buildMealsLabel, MEALS_FULL_LABELS} from "clubhouse/models/bmid";
import {EVENT_RADIO, WET_SPOT} from "clubhouse/models/provision";
import {tracked} from '@glimmer/tracking';

const TYPE_FILTER_OPTIONS = [
  {label: 'All', value: 'all'},
  {label: 'Meals', value: 'meals'},
  {label: 'Showers', value: 'showers'},
  {label: 'Event Radios', value: 'radios'}
];

export default class ProvisionTableComponent extends Component {
  @tracked typeFilter = 'all';
  typeFilterOptions = TYPE_FILTER_OPTIONS;

  constructor() {
    super(...arguments);
    this.typeFilter = this.args.initialType ?? 'all';
  }

  get mealsLabel() {
    return buildMealsLabel(this.args.package.meals, MEALS_FULL_LABELS);
  }

  get viewProvisions() {
    const provisions = this.args.provisions;
    switch (this.typeFilter) {
      case 'showers':
        return provisions.filter((p) => p.type === WET_SPOT);
      case 'radios':
        return provisions.filter((p) => p.type === EVENT_RADIO);
      case 'meals':
        return provisions.filter((p) => p.type !== WET_SPOT && p.type !== EVENT_RADIO);
      default:
        return provisions;
    }
  }
}

