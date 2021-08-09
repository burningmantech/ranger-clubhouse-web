import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqSiteCheckinRoute extends ClubhouseRoute {
  setupController(controller, model) {
    const {person} = model;
    controller.setProperties(model);
    controller.set('contactSaved', false);
    controller.set('isOnSite', person.on_site);
   }
}
