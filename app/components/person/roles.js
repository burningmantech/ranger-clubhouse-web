import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';

export default class PersonRolesComponent extends Component {
  @cached
  get combinedRoles() {
    const foundRoles = [];
    const {grantedRoles: {roles, position_roles, team_roles}} = this.args;

    this.args.roles.forEach((role) => {
      const granted = !!roles.find((r) => role.id === r.id);

      if (!granted && !position_roles.find((p) => p.role_id === role.id)) {
        return;
      }

      foundRoles.push({
        id: role.id,
        title: role.title,
        granted,
        positions: position_roles.filter((p) => p.role_id === role.id).sort((a, b) => a.title.localeCompare(b.title)),
        teams: team_roles.filter((t) => t.role_id === role.id).sort((a, b) => a.title.localeCompare(b.title)),
      });
    });

    return foundRoles;
  }
}

