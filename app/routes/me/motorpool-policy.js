import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeMotorpoolPolicyRoute extends Route.extend(MeRouteMixin) {
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('hasAgreed', controller.person.vehicle_paperwork);
  }
}
