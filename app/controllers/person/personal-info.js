import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached} from '@glimmer/tracking';
import PersonInfoValidations, {REQUIRED_PII_VALIDATIONS} from 'clubhouse/validations/person-info';
import {ShortSleeve, LongSleeve} from 'clubhouse/constants/shirts';
import {pronounOptions} from 'clubhouse/constants/pronouns';
import {ADMIN, VC} from 'clubhouse/constants/roles';
import {ADDRESS_VALIDATION_NOT_REQUIRED} from 'clubhouse/constants/person_status';

export default class PersonPersonalInfoController extends ClubhouseController {
  shortSleeveOptions = ShortSleeve;
  longSleeveOptions = LongSleeve;
  pronounOptions = pronounOptions;

  @cached
  get personInfoValidations() {
    if (ADDRESS_VALIDATION_NOT_REQUIRED.includes(this.person.status) && this.session.isAdmin) {
      return REQUIRED_PII_VALIDATIONS;
    } else {
      return PersonInfoValidations;
    }
  }

  get canEditPersonalInfo() {
    return this.session.hasRole([ADMIN, VC]);
  }

  @action
  onSubmit(model, isValid) {
    if (!isValid) {
      return;
    }
    this.house.saveModel(model, 'Personal information was successfully updated.');
  }

  @action
  onCancel() {
    this.toast.warning('Personal information editing was cancelled. No changes were saved.');
    this.router.transitionTo('person.index', this.person.id);
  }
}
