import Component from '@glimmer/component';
import {validatePresence} from 'ember-changeset-validations/validators';
import {CountryOptions, StateLabels, StateOptions} from 'clubhouse/constants/countries';
import {action} from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {STATUS_APPROVED} from "clubhouse/models/prospective-application";
import { service} from '@ember/service';
export default class VcApplicationPersonalInfoComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked stateOptions = null;
  @tracked stateLabel = null;

  countryOptions = CountryOptions;

  personalInfoValidation= {
    first_name: [validatePresence({presence: true})],
    last_name: [validatePresence({presence: true})],
    street: [validatePresence({presence: true})],
    city: [validatePresence({presence: true})],
    state: [validatePresence({presence: true})],
    postal_code: [validatePresence({presence: true})],
    country: [validatePresence({presence: true})],
  };

  @action
  formInit(form) {
    this._buildOptions(form.model.country);
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

  @action
  async confirmApproval() {
    const {application} = this.args;

    try {
      this.isSubmitting = true;
      await this.ajax.post(`prospective-application/${application.id}/status`, {data: {status: STATUS_APPROVED}});
      await application.reload();
      this.toast.success('The application has been approved, and the applicant emailed.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
