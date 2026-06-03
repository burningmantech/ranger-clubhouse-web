import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {action} from '@ember/object';
import {NotFoundError} from '@ember-data/adapter/error'
import {ADMIN, SHIFT_MANAGEMENT} from 'clubhouse/constants/roles';
import {setting} from 'clubhouse/utils/setting';
import {hash} from 'rsvp';

export default class HqRoute extends ClubhouseRoute {
  beforeModel() {
    if (!setting('HQWindowInterfaceEnabled')) {
      this.modal.info('HQ Interface not available.', 'The HQ Window Interface is only enabled while on playa event operations are going.');
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


  model({person_id}) {
    const year = this.house.currentYear();

    // hq.js is the shared parent of the shift & timesheet sub-routes, both of which
    // reload `timesheet` records via store.query('timesheet', ...). Clearing the stale
    // records here ensures the sub-routes start from a clean cache. asset-person is
    // re-queried below.
    this.store.unloadAll('timesheet');
    this.store.unloadAll('asset-person');

    // Double check to see if the person is really off duty (another HQ worker might
    // have signed them in). When already on duty, resolve undefined so `onduty` keeps a
    // deterministic shape in the model hash.
    const onduty = this.session.user?.onduty_position
      ? Promise.resolve(undefined)
      : this.session.updateOnDuty();

    // Resolve all person-scoped requests in parallel. person-event uses a composite id
    // of `${person_id}-${year}`.
    return hash({
      person: this.store.findRecord('person', person_id, {reload: true}),
      personEvent: this.store.findRecord('person-event', `${person_id}-${year}`, {reload: true}),
      personBanners: this.store.query('person-banner', {person_id, active: 1}),
      eventInfo: this.ajax.request(`person/${person_id}/event-info`, {data: {year}})
        .then(({event_info}) => event_info),

      positions: this.ajax.request(`person/${person_id}/positions`, {
        data: {include_eligibility: 1}
      }).then(({positions}) => positions),

      unread_message_count: this.ajax.request(`person/${person_id}/unread-message-count`)
        .then((result) => result.unread_message_count),

      assets: this.store.query('asset-person', {person_id, year}),

      attachments: this.store.findAll('asset-attachment', {reload: true}),
      timesheetSummary: this.ajax.request(`person/${person_id}/timesheet-summary`, {data: {year}})
        .then((result) => result.summary),
      photo: this.ajax.request(`person/${person_id}/photo`).then(({photo}) => photo),
      onduty,
    });
  }

  setupController(controller, model) {
    const onduty = this.session.user?.onduty_position;
    const person = model.person;

    // NOTE: hq/shift.hbs and hq/shift.js read `person.unread_message_count` directly off
    // the person record, so the count is carried on the record (not a controller field).
    person.set('unread_message_count', model.unread_message_count);

    // Build eventPeriods BEFORE setProperties so the controller's copy of the model does
    // not diverge from the structure the sub-routes pick up.
    const eventPeriods = {
      pre: {current: false},
      event: {current: false},
      post: {current: false},
    };
    // set model so the sub-routes can pick up the data
    model.eventPeriods = eventPeriods;
    // Guard against a null/missing/unknown event_period to avoid a crash.
    const period = model.eventInfo?.event_period;
    if (period && eventPeriods[period]) {
      eventPeriods[period].current = true;
    }
    const meals = model.eventInfo?.meals;
    if (meals) {
      for (const p of ['pre', 'event', 'post']) {
        if (meals[p]) {
          eventPeriods[p].hasPass = true;
        }
      }
    }

    controller.setProperties(model);
    controller.set('userIsMentor', (onduty?.subtype === 'mentor'));

    // Show a warning if the person is a PNV and the user is NOT a mentor.
    controller.set('showHatRackInstruction', (person.isPNV && onduty?.subtype !== 'mentor'));

    // User should be signed in to a shift
    controller.set('showSignInWarning', !onduty);

    controller.set('showNotAllowedToWork', !person.canStartShift);
  }

  @action
  updateTimesheetSummaries() {
    const {controller} = this;
    const personId = controller.person.id;
    this.ajax.request(`person/${personId}/timesheet-summary`, {data: {year: this.house.currentYear()}})
      .then((result) => {
        // The request may resolve after the route has torn down.
        if (this.isDestroying || this.isDestroyed || !this.controller) {
          return;
        }
        this.controller.set('timesheetSummary', result.summary);
      })
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
