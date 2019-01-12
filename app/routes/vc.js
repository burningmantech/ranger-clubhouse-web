import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { Role } from 'clubhouse/constants/roles';


export default class VcRoute extends Route.extend(AuthenticatedRouteMixin) {
  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.VC ]);
  }
}
