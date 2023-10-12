import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';
import validateState from "clubhouse/validators/state";
import {STATUS_OPTIONS} from "clubhouse/constants/person_status";

export default class AdminPersonCreateController extends ClubhouseController {
  @tracked person;
  @tracked isSubmitting;
  @tracked askForPassword;
  @tracked passwordForm;

  personValidations = {
    callsign: [validatePresence(true), validateFormat({min: 3})],
    first_name: [validatePresence(true)],
    last_name: [validatePresence(true)],
    email: [validatePresence(true), validateFormat({type: 'email'})],
    street1: [validatePresence(true)],
    city: [validatePresence(true)],
    state: [validateState()],
    zip: [validatePresence(true)],
    country: [validatePresence(true)],
    home_phone: [validatePresence(true), validateFormat({min: 9})],
  };

  statusOptions = STATUS_OPTIONS;

  @action
  async createPerson(model, isValid) {
    if (!isValid) {
      return;
    }

    this.isSubmitting = true;
    try {
      await model.save();
      this.askForPassword = true;
    } catch (response) {
      this.house.handleErrorResponse(response, model);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  closePassword() {
    this.router.transitionTo('person.index', this.person.id);
    this.askForPassword = false;
  }
}

