import Component from '@glimmer/component';
import EmberObject, { action } from '@ember/object';
import {Role} from 'clubhouse/constants/roles';

export default class PersonRoleFormComponent extends Component {
  roleForm = EmberObject.create({roleIds: this.args.roleIds});

  // Create a list of roles options to check
  get roleOptions() {
    const roles = this.args.roles;

    if (!roles) {
      return [];
    }

    return roles.map((role) => {
      return [role.title, role.id];
    });
  }

  @action
  save(model, isValid) {
    const originalIds = this.args.roleIds;
    const updatedIds = model.roleIds;
    const wantAdmin = (!originalIds.includes(Role.ADMIN) && updatedIds.includes(Role.ADMIN));
    const wantPII = (!originalIds.includes(Role.VIEW_PII) && updatedIds.includes(Role.VIEW_PII));
    const onSave = this.args.onSave;

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
