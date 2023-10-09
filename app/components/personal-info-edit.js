import Component from '@glimmer/component';
import {ADDRESS_VALIDATION_NOT_REQUIRED} from "clubhouse/constants/person_status";
import PersonInfoValidations, {REQUIRED_PII_VALIDATIONS} from "clubhouse/validations/person-info";
import {pronounOptions} from 'clubhouse/constants/pronouns';
import {cached} from '@glimmer/tracking';
import {GenderIdentityOptions} from 'clubhouse/models/person';
import {service} from '@ember/service';

export default class PersonalInfoEditComponent extends Component {
  @service session;

  pronounOptions = pronounOptions;
  genderIdentityOptions = GenderIdentityOptions;

  @cached
  get personInfoValidations() {
    if (ADDRESS_VALIDATION_NOT_REQUIRED.includes(this.args.person.status) && this.session.isAdmin) {
      return REQUIRED_PII_VALIDATIONS;
    } else {
      return PersonInfoValidations;
    }
  }
}
