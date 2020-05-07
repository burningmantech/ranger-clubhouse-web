import Component from '@glimmer/component';
import {computed} from '@ember/object';
import {CountryOptions, StateOptions, StateLabels} from 'clubhouse/constants/countries';

export default class PersonAddressEditComponent extends Component {
  countryOptions = CountryOptions;

  @computed('args.f.model.country')
  get stateOptions() {
    const country = this.args.f.model.country;

    return StateOptions[country];
  }

  @computed('args.f.model.country')
  get stateLabel() {
    return StateLabels[this.args.f.model.country] || 'State/Territory (not required)';
  }
}
