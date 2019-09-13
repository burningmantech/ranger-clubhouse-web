import Route from '@ember/routing/route';

export default class HqSiteCheckinRoute extends Route {
  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
    controller.set('contactSaved', false);
    controller.set('isOnSite', model.person.on_site);
  }
}
