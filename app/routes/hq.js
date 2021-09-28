import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {action} from '@ember/object';
import {NotFoundError} from '@ember-data/adapter/error'
import {ADMIN, MANAGE} from 'clubhouse/constants/roles';
import RSVP from 'rsvp';
import {config} from 'clubhouse/utils/config';

export default class HqRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, MANAGE];

  beforeModel() {
    if (!config('HQWindowInterfaceEnabled')) {
      this.toast.error('The HQ Window Interface is only enabled during a normal event period.');
      this.router.transitionTo('me.homepage');
      return false;
    }

    return super.beforeModel(...arguments);
  }


  model({person_id}) {
    const year = this.house.currentYear();

    this.store.unloadAll('timesheet');
    this.store.unloadAll('asset-person');

    return RSVP.hash({
      person: this.store.findRecord('person', person_id, {reload: true}),
      personEvent: this.store.findRecord('person-event', `${person_id}-${year}`, {reload: true}),
      eventInfo: this.ajax.request(`person/${person_id}/event-info`, {data: {year}})
        .then((result) => result.event_info),

      positions: this.ajax.request(`person/${person_id}/positions`, {
        data: {include_training: 1, year}
      }).then((results) => results.positions),

      unread_message_count: this.ajax.request(`person/${person_id}/unread-message-count`)
        .then((result) => result.unread_message_count),

      assets: this.store.query('asset-person', {person_id, year}),

      attachments: this.store.findAll('asset-attachment', {reload: true}),
      timesheetSummary: this.ajax.request(`person/${person_id}/timesheet-summary`, {data: {year}})
        .then((result) => result.summary),
    });
  }

  setupController(controller, model) {
    const onduty = this.session.user.onduty_position;

    const person = model.person;
    person.set('unread_message_count', model.unread_message_count);
    controller.setProperties(model);
    controller.set('photo', null);
    controller.set('userIsMentor', (onduty && onduty.subtype === 'mentor'));

    // Show a warning if the person is a PNV and the user is NOT a mentor.
    controller.set('showAlphaWarning', (person.isPNV && (!onduty || onduty.subtype !== 'mentor')));
    controller.set('showSignInWarning', !onduty);

    // Allow the photo to lazy load.
    this.ajax.request(`person/${person.id}/photo`)
      .then((result) => controller.set('photo', result.photo))
      .catch(() => {
        controller.set('photo', {status: 'error', message: 'There was a server error.'});
      })
  }

  @action
  async updateShiftSummaries() {
    const {controller} = this;
    const personId = controller.person.id;
    this.ajax.request(`person/${personId}/timesheet-summary`, {data: {year: this.house.currentYear()}})
      .then((result) => this.controller.set('timesheetSummary', result.summary))
      .catch((response) => this.house.handleErrorResponse(response))
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
}
