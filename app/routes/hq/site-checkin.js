import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqSiteCheckinRoute extends ClubhouseRoute {
  setupController(controller, model) {
    super.setupController(controller, model);

    const {person, personEvent, eventInfo, assets, attachments, eventPeriods} = model;
    // Explicit allow-list: the leaf has no model() hook, so only fan the keys it
    // actually consumes onto the controller (avoids hidden, untracked props).
    controller.setProperties({person, personEvent, eventInfo, assets, attachments, eventPeriods});

    // Single owner for per-entry reset of all wizard/submit state.
    controller.resetState();
  }
}
