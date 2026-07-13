import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {action} from '@ember/object';
import {NotFoundError} from '@ember-data/adapter/error'
import {ADMIN, SHIFT_MANAGEMENT} from 'clubhouse/constants/roles';
import {setting} from 'clubhouse/utils/setting';

export default class HqRoute extends ClubhouseRoute {
  beforeModel() {
    const result = super.beforeModel(...arguments);

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

    return result;
  }


  async model({person_id}) {
    const year = this.session.currentYear();

    // hq.js is the shared parent of the shift & timesheet sub-routes, both of which
    // reload `timesheet` records via store.query('timesheet', ...). Clearing the stale
    // records here ensures the sub-routes start from a clean cache. asset-person is
    // re-queried below.
    this.store.unloadAll('timesheet');
    this.store.unloadAll('asset-person');

    // Double check to see if the person is really off duty (another HQ worker might
    // have signed them in). When already on duty, resolve undefined so `onduty` keeps a
    // deterministic shape in the model. Kicked off before the awaits below so it
    // resolves while the person-scoped requests run.
    const onduty = this.session.user?.onduty_position
      ? Promise.resolve(undefined)
      : this.session.updateOnDuty();

    // person-event uses a composite id of `${person_id}-${year}`.
    const [
      person,
      personEvent,
      personBanners,
      eventInfo,
      positions,
      unreadMessageCount,
      assets,
      attachments,
      timesheetSummary,
      photo,
      ondutyResult,
    ] = await Promise.all([
      this.store.findRecord('person', person_id, {reload: true}),
      this.store.findRecord('person-event', `${person_id}-${year}`, {reload: true}),
      this.store.query('person-banner', {person_id, active: 1}),
      this.ajax.request(`person/${person_id}/event-info`, {data: {year}}),
      this.ajax.request(`person/${person_id}/positions`, {data: {include_eligibility: 1}}),
      this.ajax.request(`person/${person_id}/unread-message-count`),
      this.store.query('asset-person', {person_id, year}),
      this.store.findAll('asset-attachment'),
      this.ajax.request(`person/${person_id}/timesheet-summary`, {data: {year}}),
      this.ajax.request(`person/${person_id}/photo`),
      onduty,
    ]);

    return {
      person,
      personEvent,
      personBanners,
      eventInfo: eventInfo.event_info,
      positions: positions.positions,
      unread_message_count: unreadMessageCount.unread_message_count,
      assets,
      attachments,
      timesheetSummary: timesheetSummary.summary,
      photo: photo.photo,
      onduty: ondutyResult,
    };
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
    controller.set('showTicketsAndProvisions', false);
  }

  @action
  async updateTimesheetSummaries() {
    const {controller} = this;
    const personId = controller.person.id;
    try {
      const result = await this.ajax.request(`person/${personId}/timesheet-summary`, {data: {year: this.session.currentYear()}});
      // The request may resolve after the route has torn down, or after the person
      // was switched out from under this controller.
      if (this.isDestroying || this.isDestroyed || !this.controller || this.controller.person?.id !== personId) {
        return;
      }
      this.controller.set('timesheetSummary', result.summary);
    } catch (response) {
      this.errors.handleErrorResponse(response);
    }
  }

  @action
  error(response) {
    if (response instanceof NotFoundError) {
      this.toast.error('The person record was not found.');
      this.router.transitionTo('me');
      return false;
    } else {
      this.errors.handleErrorResponse(response);
      return true;
    }
  }
}
