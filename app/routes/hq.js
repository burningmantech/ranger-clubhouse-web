import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { Role } from 'clubhouse/constants/roles';
import RSVP from 'rsvp';
import DS from 'ember-data';


export default class HqRoute extends Route.extend(AuthenticatedRouteMixin) {
  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.MANAGE ]);
  }

  model({ person_id }) {
    const year = this.house.currentYear();

    return RSVP.hash({
      person: this.store.find('person', person_id),

      eventInfo: this.ajax.request(`person/${person_id}/event-info`, { data: { year } })
                  .then((result) => result.event_info),

      positions: this.ajax.request(`person/${person_id}/positions`,{
                  data: { include_training: 1, year }
                }).then((results) => results.positions),

      credits: this.ajax.request(`person/${person_id}/credits`, {
                data: { year }
              }).then((result) => result.credits),

      timesheets: this.store.query('timesheet', { person_id, year }),

      unread_message_count: this.ajax.request(`person/${person_id}/unread-message-count`)
          .then((result) => result.unread_message_count),

      assets: this.store.query('asset-person', { person_id, year }),

      attachments: this.store.findAll('asset-attachment'),

      imminentSlots: this.ajax.request(`person/${person_id}/schedule/imminent`)
        .then((result) => result.slots)
    });
  }

  setupController(controller, model) {
    const person = model.person;
    person.set('unread_message_count', model.unread_message_count);
    controller.setProperties(model);

    // Allow the photo to lazy load.
    this.ajax.request(`person/${person.id}/photo`)
      .then((result) => controller.set('photo', result.photo))
      .catch(() => {
        controller.set('photo', { status: 'error', message: 'There was a server error.' });
      })
  }

  @action
  error(response) {
    if (response instanceof DS.NotFoundError) {
      this.toast.error('The person record was not found.');
      this.transitionTo('me');
      return false;
    } else {
      this.house.handleErrorResponse(response);
      return true;
    }
  }
}
