import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

// Pages this one hands off to (deliver the messages, run the site
// registration). Going there is part of dealing with the person, not walking
// away from an unhandled shift.
const HandoffRoutes = ['hq.messages', 'hq.site-checkin'];

/**
 * The person a transition's `to`/`from` route info is showing.
 *
 * @param {object} routeInfo
 * @returns {string|undefined}
 */

function personIdFor(routeInfo) {
  return routeInfo?.find(route => route.name === 'hq')?.params?.person_id;
}

export default class HqShiftRoute extends ClubhouseRoute {
  /**
   * Guard against navigating away with an unhandled shift or an unsubmitted
   * barcode. Bound once and registered/torn down with the route lifecycle.
   */
  routeWillChange = (transition) => {
    const controller = this.controllerFor('hq.shift');

    // abort() emits a synthetic transition where `to` is where we already are.
    if (transition.isAborted || transition.to === transition.from) {
      return;
    }

    if (transition.to?.find(route => route.name.match(/loading/))) {
      return;
    }

    if (!transition.from?.find(route => route.name === this.routeName)) {
      return;
    }

    // Re-entering the SAME person's shift page is not leaving it. Another
    // person's shift page (e.g. the browser back button) is.
    if (transition.to?.find(route => route.name === this.routeName)
      && personIdFor(transition.to) === personIdFor(transition.from)) {
      return;
    }

    if (controller.noShiftHandled
      && !transition.to?.find(route => HandoffRoutes.includes(route.name))) {
      controller.showNoShiftHandled = true;
      // Always hold the newest transition - the dialog retries it.
      controller.shiftTransition = transition;
      transition.abort();
      return;
    }

    if (!controller.unsubmittedBarcode) {
      return;
    }

    controller.showUnsubmittedBarcodeDialog = true;
    transition.abort();
  };

  activate() {
    super.activate(...arguments);
    this.router.on('routeWillChange', this.routeWillChange);
  }

  deactivate() {
    this.router.off('routeWillChange', this.routeWillChange);
    super.deactivate(...arguments);
  }

  async model() {
    const person_id = this.modelFor('hq').person.id;
    const year = this.session.currentYear();

    const [upcomingSlots, scheduleRecommendations, timesheets] = await Promise.all([
      this.ajax.request(`person/${person_id}/schedule/upcoming`),
      this.ajax.request(`person/${person_id}/schedule/recommendations`),
      this.store.query('timesheet', {person_id, year, check_times: 1}),
    ]);

    return {upcomingSlots, scheduleRecommendations, timesheets};
  }

  setupController(controller, model) {
    const hqModel = this.modelFor('hq');
    const {person, personEvent, eventInfo, positions, assets, attachments, eventPeriods} = hqModel;
    // Explicit allow-list: only fan the keys the controller/template actually
    // consume onto the controller (avoids hidden, untracked props).
    controller.setProperties({person, personEvent, eventInfo, positions, assets, attachments, eventPeriods});
    controller.setProperties(model);
    // Single owner for the per-entry reset of the dialog & guard state.
    controller.resetState();
    controller.timesheetsToReview = model.timesheets.filter((t) => t.isUnverified);
    // Only ask about an unhandled shift when a shift could be worked at all -
    // an off site person is directed to Site Registration first.
    controller.noShiftHandled = !!person.on_site;

    controller.initializeTodos(model);

    controller.showIsAlpha = (!this.controllerFor('hq').userIsMentor && person.isPNV);
  }
}
