import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { Role } from 'clubhouse/constants/roles';

// Namespace route - nothing really happening here other than to
// verify the user has the right role

export default class ReportsRoute extends Route {
  beforeModel() {
    this.house.roleCheck(Role.MANAGE);
  }
}
