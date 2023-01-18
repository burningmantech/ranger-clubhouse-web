import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';

export default class PersonRolesComponent extends Component {
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

       let notGranted = false;

      // See if the role is only granted thru the positions, said positions require training before the roles
      // are granted, and the person is not (ART) trained.
      if (!granted
        && !teams.length
        && positions.filter((p) => p.require_training_for_roles).length === positions.length
        && !positions.some((p) => p.is_trained)) {
        notGranted = true;
      }

      foundRoles.push({
        id: role.id,
        title: role.title,
        granted,
        positions,
        teams,
        notGranted,
      });
    });

    return foundRoles;
  }
}

