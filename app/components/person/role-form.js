import Component from '@glimmer/component';
import {action} from '@ember/object';
import {TECH_NINJA, ADMIN, VIEW_PII} from 'clubhouse/constants/roles';
import {inject as service} from '@ember/service';

export default class PersonRoleFormComponent extends Component {
  @service session;
  roleForm = {roleIds: this.args.roleIds};
  isTechNinja = this.session.hasRole(TECH_NINJA);

  // Create a list of roles options to check
  get roleOptions() {
    const {roles} = this.args;
    const isTechNinja = this.isTechNinja;

    if (!roles) {
      return [];
    }

    return roles.map((role) => ({title: role.title, id: role.id, disabled: (role.id === TECH_NINJA && !isTechNinja)}));
  }

  @action
  save(model, isValid) {
    const {onSave} = this.args;
    const originalIds = this.args.roleIds;
    const updatedIds = model.roleIds;
    const wantAdmin = (!originalIds.includes(ADMIN) && updatedIds.includes(ADMIN));
    const wantPII = (!originalIds.includes(VIEW_PII) && updatedIds.includes(VIEW_PII));

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
          onSave(model, isValid);
        }
      );
    } else {
      onSave(model, isValid);
    }
  }

  @action
  cancel(model) {
    this.onCancel(model);
  }
}
