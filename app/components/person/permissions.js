import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {action} from '@ember/object';
import {MANAGE_ON_PLAYA, TECH_NINJA} from 'clubhouse/constants/roles';
import {setting} from "clubhouse/utils/setting";

export default class PersonRolesComponent extends Component {
  @service ajax;
  @service house;
  @service session;
  @service toast;

  @tracked cachedRoles;

  get isTechNinja() {
    return this.session.hasRole(TECH_NINJA);
  }

  get isAdmin() {
    return this.session.isAdmin;
  }

  @cached
  get combinedRoles() {
    const foundRoles = [];
    const {grantedRoles: {roles, position_roles, team_roles}} = this.args;

    this.args.roles.forEach((role) => {
      const granted = !!roles.find((r) => role.id === r.id);
      const teams = team_roles.filter((t) => t.role_id === role.id).sort((a, b) => a.title.localeCompare(b.title));
      const positions = position_roles.filter((p) => p.role_id === role.id).sort((a, b) => a.title.localeCompare(b.title));

      if (!granted && !positions.length && !teams.length) {
        return;
      }

      let active = true;
      if (role.id === MANAGE_ON_PLAYA) {
        active = !!setting('EventManagementOnPlayaEnabled');
        // Fall thru..
      }
      // See if the role is only granted thru the positions, said positions require training before the roles
      // are granted, and the person is not (ART) trained.
      if (!granted
        && !teams.length
        && positions.filter((p) => p.require_training_for_roles).length === positions.length
        && !positions.some((p) => p.is_trained)) {
        active = false;
      }

      foundRoles.push({
        id: role.id,
        title: role.title,
        granted,
        positions,
        teams,
        active,
      });
    });

    return foundRoles;
  }

  @action
  async showCachedRolesAction() {
    try {
      this.cachedRoles = await this.ajax.request('role/inspect-cache', {data: {person_id: this.args.person.id}});
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  @action
  hideCachedRoles() {
    this.cachedRoles = null;
  }

  /**
   * Clear any cached roles - just in case the cache got f**ked up.
   */

  @action
  clearRoleCacheAction() {
    this.ajax.request('role/clear-cache', {method: 'POST', data: {person_id: this.args.person.id}}).then(() => {
      this.toast.success('Role cache has been cleared.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}

