import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqShiftRoute extends ClubhouseRoute {
  /**
   * Guard against navigating away with an unhandled shift or an unsubmitted
   * barcode. Bound once and registered/torn down with the route lifecycle.
   */
  routeWillChange = (transition) => {
    const controller = this.controllerFor('hq.shift');

    if (transition.to?.find(route => route.name === this.routeName) ||
      transition.to?.find(route => route.name.match(/loading/))) {
      return;
    }

    if (!transition.from?.find(route => route.name === this.routeName)) {
      return;
    }

    if (controller.noShiftHandled && !controller.showNoShiftHandled) {
      controller.showNoShiftHandled = true;
      controller.shiftTransition = transition;
      transition.abort();
      return;
    }

    if (!controller.unsubmittedBarcode) {
      return;
    }

    if (!controller.showUnsubmittedBarcodeDialog) {
      // May see multiple route transitions, only abort once.
      controller.showUnsubmittedBarcodeDialog = true;
      transition.abort();
    }
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
    controller.endedShiftEntry = null;
    controller.unsubmittedBarcode = '';
    controller._findOnDuty();
    controller.timesheetsToReview = model.timesheets.filter((t) => t.isUnverified);
    controller.noShiftHandled = true;

    controller.initializeTodos(model);

    controller.showIsAlpha = (!this.controllerFor('hq').userIsMentor && person.isPNV);
  }
}
