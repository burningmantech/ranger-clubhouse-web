import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {action} from '@ember/object';
import humanize from "clubhouse/utils/humanize";
import {ADMIN, MANAGE, VC, MENTOR, TRAINER} from 'clubhouse/constants/roles';
import {NotFoundError} from '@ember-data/adapter/error';

export default class PersonRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, MANAGE, VC, MENTOR, TRAINER];

  async model({person_id}) {
    const person = await this.store.findRecord('person', person_id, {reload: true});
    person.unread_message_count = (await this.ajax.request(`person/${person_id}/unread-message-count`)).unread_message_count;
    return person;
  }

  setupController(controller, model) {
    controller.person = model;
  }

  @action
  error(response) {
    if (response instanceof NotFoundError || +response.status === 404) {
      this.toast.error('The person record was not found.');
      this.router.transitionTo('me');
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
      .filter((x) => (x !== 'index' && x !== 'loading'))
      .map((x) => x === 'person' ? model.callsign : humanize(x))
      .reverse()
      .join(' | ');
  }
}
