import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqSiteCheckinRoute extends ClubhouseRoute {
  setupController(controller, model) {
    const {person} = model;
    controller.setProperties(model);
    controller.contactSaved = false;
    controller.isOnSite = person.on_site;
    controller.showSiteCheckInWizard = false;
    controller.siteCheckInStarted = false;
    controller.siteCheckInFinished = false;
   }
}
