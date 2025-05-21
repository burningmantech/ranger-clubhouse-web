import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {action} from '@ember/object';
import {NotFoundError} from '@ember-data/adapter/error'
import {ADMIN, SHIFT_MANAGEMENT} from 'clubhouse/constants/roles';
import {setting} from 'clubhouse/utils/setting';

export default class HqRoute extends ClubhouseRoute {
  beforeModel() {
    if (!setting('HQWindowInterfaceEnabled')) {
      this.modal.info('HQ Interface not available.', 'The HQ Window Interface is only enabled while the event operations are running.');
      this.router.transitionTo('me.homepage');
      return false;
    }

    if (!this.session.hasRole([ADMIN, SHIFT_MANAGEMENT])) {
      this.modal.info('Not Authorized.', 'You do not have either the Admin or Shift Management permissions.');
      this.router.transitionTo('me.homepage');
      return false;
    }

    return super.beforeModel(...arguments);
  }


  async model({person_id}) {
    const year = this.house.currentYear();

    this.store.unloadAll('timesheet');
    this.store.unloadAll('asset-person');

    const requests = {
      person: await this.store.findRecord('person', person_id, {reload: true}),
      personEvent: await this.store.findRecord('person-event', `${person_id}-${year}`, {reload: true}),
      personBanners: await this.store.query('person-banner', {person_id, active: 1}),
      eventInfo: await this.ajax.request(`person/${person_id}/event-info`, {data: {year}})
        .then(({event_info}) => event_info),

      positions: await this.ajax.request(`person/${person_id}/positions`, {
        data: {include_eligibility: 1}
      }).then(({positions}) => positions),

      unread_message_count: await this.ajax.request(`person/${person_id}/unread-message-count`)
        .then((result) => result.unread_message_count),

      assets: await this.store.query('asset-person', {person_id, year}),

      attachments: await this.store.findAll('asset-attachment', {reload: true}),
      timesheetSummary: await this.ajax.request(`person/${person_id}/timesheet-summary`, {data: {year}})
        .then((result) => result.summary),
      photo: await this.ajax.request(`person/${person_id}/photo`).then(({photo}) => photo),
    }

    if (!this.session.user.onduty_position) {
      // Double check to see if the person is really off duty (another HQ worker might have signed them in)
      requests.onduty = await this.session.updateOnDuty();
    }

    return requests;
  }

  setupController(controller, model) {
    const onduty = this.session.user.onduty_position;
    const person = model.person;

    person.set('unread_message_count', model.unread_message_count);
    controller.setProperties(model);
    controller.set('userIsMentor', (onduty?.subtype === 'mentor'));

    // Show a warning if the person is a PNV and the user is NOT a mentor.
    controller.set('showHatRackInstruction', (person.isPNV && onduty?.subtype !== 'mentor'));

    // User should be signed in to a shift
    controller.set('showSignInWarning', !onduty);

    controller.set('showNotAllowedToWork', !person.canStartShift);

    const eventPeriods = {
      pre: {current: false},
      event: {current: false},
      post: {current: false},
    };
    // set model so the sub-routes can pick up the data
    model.eventPeriods = eventPeriods;
    eventPeriods[model.eventInfo.event_period].current = true;
    const {meals} = model.eventInfo;
    if (meals) {
      for (const period of ['pre', 'event', 'post']) {
        if (meals[period]) {
          eventPeriods[period].hasPass = true;
        }
      }
    }
  }

  @action
  updateTimesheetSummaries() {
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
      this.router.transitionTo('me');
      return false;
    } else {
      this.house.handleErrorResponse(response);
      return true;
    }
  }
}
