import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { CountryOptions, StateOptions, StateLabels } from 'clubhouse/constants/countries';

export default class PersonAddressEditComponent extends Component {
  @argument('object') f;

  countryOptions = CountryOptions;

  @computed('f.model.country')
  get stateOptions() {
    const country = this.f.model.get('country');

    return StateOptions[country];
  }

  @computed('f.model.country')
  get stateLabel() {
    return StateLabels[this.f.model.get('country')] || 'State/Territory (not required)';
  }
}
