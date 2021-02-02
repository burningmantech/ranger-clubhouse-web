import Route from '@ember/routing/route';
import {action} from '@ember/object';
import {humanize} from 'ember-cli-string-helpers/helpers/humanize';
import {inject as service} from '@ember/service';
import {Role} from 'clubhouse/constants/roles';
import {NotFoundError} from '@ember-data/adapter/error';
import RSVP from 'rsvp';

export default class PersonRoute extends Route {
  @service router;

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([Role.ADMIN, Role.MANAGE, Role.VC, Role.MENTOR, Role.TRAINER]);
  }

  async model({person_id}) {
    const {person, years} = await RSVP.hash({
      person: this.store.findRecord('person', person_id, {reload: true}),
      years: this.ajax.request(`person/${person_id}/years`)
    });

    Object.assign(person, years);

    return person;
  }

  setupController(controller, model) {
    controller.set('person', model);
  }

  @action
  error(response) {
    if (response instanceof NotFoundError) {
      this.toast.error('The person record was not found.');
      this.transitionTo('me');
      return false;
    } else {
      this.house.handleErrorResponse(response);
      return true;
    }
  }

  titleToken(model) {
    // Includes the full route path like ApplicationRoute, but replace "Person" with their callsign.
    return this.router.currentRouteName
      .split('.')
      .filter((x) => x !== 'index')
      .map((x) => x === 'person' ? model.callsign : humanize([x]))
      .reverse()
      .join(' | ');
  }
}
