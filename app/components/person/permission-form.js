import Component from '@glimmer/component';
import {action} from '@ember/object';
import {TECH_NINJA, ADMIN, VIEW_PII} from 'clubhouse/constants/roles';
import {service} from '@ember/service';
import inGroups from 'clubhouse/utils/in-groups';

export default class PersonRoleFormComponent extends Component {
  @service session;
  @service modal;

  isTechNinja = this.session.hasRole(TECH_NINJA);

  constructor() {
    super(...arguments);

    const {grantedRoles, roles} = this.args;
    const {isTechNinja} = this;

    this.roleIds = grantedRoles.roles.map((r) => r.id);
    this.roleForm = {roleIds: this.roleIds};

    this.roles = roles.map((role) => ({
      id: role.id,
      title: role.title,
      selected: this.roleIds.includes(role.id),
      positions: grantedRoles.position_roles.filter((p) => p.role_id === role.id),
      teams: grantedRoles.team_roles.filter((p) => p.role_id === role.id),
      disabled: ((role.id === TECH_NINJA || role.id === ADMIN) && !isTechNinja),
    }));

    this.roleGroups = inGroups(this.roles, 3);
  }

  @action
  clickRole(role, event) {
    const isChecked = !role.selected;

    if (!isChecked || (!role.teams.length && !role.positions.length)) {
      role.selected = isChecked;
      return;
    }

    const target = event.target;
    target.checked = false;
    this.modal.confirm('Confirm Manual Permission Grant',
      `The person already has the "${role.title}" permission through a team membership and/or a position grant. Are you sure you want to manually grant the permission as well?`,
      () => {
        role.selected = true;
        target.checked = true;
      });
  }


  @action
  save() {
    const {onSave} = this.args;
    const wantAdmin = this._wantRole(this.roleIds, this.roles, ADMIN),
      wantPII = this._wantRole(this.roleIds, this.roles, VIEW_PII);
    if (wantAdmin || wantPII) {
      let abilities;
      const roles = [];

      if (wantAdmin) {
        abilities = 'have full administrator privileges including being able to view and modify sensitive information';
        roles.push('Admin');
      } else if (wantPII) {
        abilities = 'be able to view sensitive information';
      }

      if (wantPII) {
        roles.push('View Personal Info');
      }

      this.modal.confirm('Confirmation Required',
        `WARNING: The ${roles.join(' and ')} role${roles.length > 1 ? 's' : ''} requires prior approval by the Ranger Council. This person will ${abilities}. Are you absolutely 100% sure you want to do this?`,
        () => {
          onSave(this.roles);
        }
      );
    } else {
      onSave(this.roles);
    }
  }

  _wantRole(originalRoles, newRoles, roleId) {
    return (!originalRoles.includes(roleId) && !!newRoles.find((r) => r.id === roleId && r.selected));
  }

  @action
  cancel(model) {
    this.onCancel(model);
  }
}
