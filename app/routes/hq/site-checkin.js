import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqSiteCheckinRoute extends ClubhouseRoute {
  setupController(controller, model) {
    const {person} = model;
    const onduty = this.session.user.onduty_position;
    controller.setProperties(model);
    controller.set('contactSaved', false);
    controller.set('isOnSite', person.on_site);
    // Show a warning if the person is a PNV and the user is NOT a mentor.
    controller.set('showAlphaWarning', (person.isPNV && (!onduty || onduty.subtype !== 'mentor')));
  }
}
