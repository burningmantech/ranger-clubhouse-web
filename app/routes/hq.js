import Route from '@ember/routing/route';
import { action } from '@ember/object';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { Role } from 'clubhouse/constants/roles';
import RSVP from 'rsvp';
import { NotFoundError } from '@ember-data/adapter/error'


export default class HqRoute extends Route.extend(AuthenticatedRouteMixin) {
  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([ Role.ADMIN, Role.MANAGE ]);
  }

  model({ person_id }) {
    const year = this.house.currentYear();

    this.store.unloadAll('timesheet');
    this.store.unloadAll('asset-person');

    return RSVP.hash({
      person: this.store.findRecord('person', person_id, { reload: true }),

      eventInfo: this.ajax.request(`person/${person_id}/event-info`, { data: { year } })
                  .then((result) => result.event_info),

      personEvent: this.store.findRecord('person-event', `${this.session.userId}-${this.house.currentYear()}`, { reload: true }),

      positions: this.ajax.request(`person/${person_id}/positions`,{
                  data: { include_training: 1, year }
                }).then((results) => results.positions),

      timesheets: this.store.query('timesheet', { person_id, year }),

      unread_message_count: this.ajax.request(`person/${person_id}/unread-message-count`)
          .then((result) => result.unread_message_count),

      assets: this.store.query('asset-person', { person_id, year }),

      attachments: this.store.findAll('asset-attachment', { reload: true }),

      expected: this.ajax.request(`person/${person_id}/schedule/expected`),

      timesheetSummary: this.ajax.request(`person/${person_id}/timesheet-summary`, { data: { year }}).then((result) => result.summary),
    });
  }

  setupController(controller, model) {
    const onduty = this.session.user.onduty_position;

    const person = model.person;
    person.set('unread_message_count', model.unread_message_count);
    controller.setProperties(model);
    controller.set('photo', null);
    controller.set('meals', model.eventInfo.meals);
    controller.set('userIsMentor', (onduty && onduty.subtype === 'mentor'));

    // Allow the photo to lazy load.
    this.ajax.request(`person/${person.id}/photo`)
      .then((result) => controller.set('photo', result.photo))
      .catch(() => {
        controller.set('photo', { status: 'error', message: 'There was a server error.' });
      })
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

  @action
  refreshHQSidebar() {
    this.ajax.request(`person/${this.modelFor('hq').person.id}/timesheet-summary`, { data: { year: this.house.currentYear() }}).then((result) => {
      this.controllerFor('hq').set('timesheetSummary', result.summary);
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
