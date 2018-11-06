import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { Role } from 'clubhouse/constants/roles';

export default class AdminRoute extends Route.extend(AuthenticatedRouteMixin) {
  beforeModel() {
    this.house.roleCheck([Role.EDIT_SLOTS, Role.ADMIN], this);
  }
}
