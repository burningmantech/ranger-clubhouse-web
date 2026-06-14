import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import { tracked} from '@glimmer/tracking';
import {ADMIN, VC} from 'clubhouse/constants/roles';

export default class PersonPersonalInfoController extends ClubhouseController {
  @tracked person;
  @tracked tshirtOptions;
  @tracked longSleeveOptions;
  @tracked shirtsById;

   get canEditPersonalInfo() {
    return this.session.hasRole([ADMIN, VC]);
  }

  @action
  async savePerson(model, isValid) {
    if (!isValid) {
      return false;
    }

    return this.saveModel.save({model, message: 'Personal info was successfully updated.'});
  }
}
