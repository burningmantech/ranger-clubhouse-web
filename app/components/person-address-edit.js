import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {CountryOptions, StateOptions, StateLabels} from 'clubhouse/constants/countries';

export default class PersonAddressEditComponent extends Component {
  @tracked stateOptions = null;
  @tracked stateLabel = null;

  countryOptions = CountryOptions;

  constructor() {
    super(...arguments);

    this._buildOptions(this.args.f.model.country);
  }

  @action
  countryChange(field, country) {
    this._buildOptions(country);
  }

  _buildOptions(country) {
    this.stateOptions = StateOptions[country];
    if (country) {
      this.stateLabel = this.stateOptions ? StateLabels[country] : 'State/Territory (not required)';
    } else {
      this.stateLabel = '--';
    }
  }
}
