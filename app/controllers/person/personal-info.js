import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { Role } from 'clubhouse/constants/roles';
import PersonInfoValidations from 'clubhouse/validations/person-info';

import {
  ShortSleeve as ShortSleeveOptions,
  LongSleeve as LongSleeveOptions
} from 'clubhouse/constants/shirts';


export default class PersonPersonalInfoController extends Controller {
  personInfoValidations = PersonInfoValidations;
  shortSleeveOptions = ShortSleeveOptions;
  longSleeveOptions = LongSleeveOptions;

  @computed('session.user')
  get canEditPersonalInfo() {
    const user = this.session.user;

    return user.hasRole(Role.ADMIN);
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
