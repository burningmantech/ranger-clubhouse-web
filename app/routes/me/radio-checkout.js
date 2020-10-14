import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeRadioCheckoutRoute extends Route.extend(MeRouteMixin) {
  model() {
    return this.store.findRecord('person-event', `${this.session.userId}-${this.house.currentYear()}`, { reload: true });
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('me'));
    controller.set('personEvent', model);
    controller.set('hasAgreed', model.asset_authorized);
    controller.set('documentHasLoaded', false);
  }
}
