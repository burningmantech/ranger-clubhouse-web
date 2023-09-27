import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import PersonInfoValidations, {REQUIRED_PII_VALIDATIONS} from 'clubhouse/validations/person-info';
import {pronounOptions} from 'clubhouse/constants/pronouns';
import {ADMIN, VC} from 'clubhouse/constants/roles';
import {ADDRESS_VALIDATION_NOT_REQUIRED} from 'clubhouse/constants/person_status';
import { GenderIdentityOptions} from 'clubhouse/models/person';

export default class PersonPersonalInfoController extends ClubhouseController {
  @tracked person;
  @tracked tshirtOptions;
  @tracked longSleeveOptions;
  @tracked shirtsById;

  pronounOptions = pronounOptions;
  genderIdentityOptions = GenderIdentityOptions;

  @cached
  get personInfoValidations() {
    if (ADDRESS_VALIDATION_NOT_REQUIRED.includes(this.person.status) && this.session.isAdmin) {
      return REQUIRED_PII_VALIDATIONS;
    } else {
      return PersonInfoValidations;
    }
  }

  @action
  shirtTitle(shirtId) {
    if (!shirtId) {
      return 'Unknown';
    }

    return !shirtId ? 'Unknown' : (this.shirtsById[shirtId]?.title ?? `Unknown Swag ID ${shirtId}`);
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
