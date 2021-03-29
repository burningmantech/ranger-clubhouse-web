import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { Role } from 'clubhouse/constants/roles';
import PersonInfoValidations from 'clubhouse/validations/person-info';
import { ShortSleeve, LongSleeve } from 'clubhouse/constants/shirts';
import { pronounOptions } from 'clubhouse/constants/pronouns';

export default class PersonPersonalInfoController extends ClubhouseController {
  personInfoValidations = PersonInfoValidations;
  shortSleeveOptions = ShortSleeve;
  longSleeveOptions = LongSleeve;
  pronounOptions = pronounOptions;

  get canEditPersonalInfo() {
    return this.session.hasRole(Role.ADMIN);
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
    this.transitionToRoute('person.index', this.person.id);
  }
}
