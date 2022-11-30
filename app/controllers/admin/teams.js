import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {
  ART_TRAINER,
  MANAGE,
  MANAGE_ON_PLAYA,
  MEGAPHONE,
  MENTOR,
  TECH_NINJA,
  TIMESHEET_MANAGEMENT,
  TRAINER,
  TRAINER_SEASONAL,
  VC,
} from 'clubhouse/constants/roles';
import {TypeLabels, TYPE_CADRE, TYPE_TEAM, TYPE_DELEGATION} from 'clubhouse/models/team';
import { htmlSafe } from '@ember/template';

const ALLOWED_ROLES = [
  ART_TRAINER,
  MANAGE,
  MANAGE_ON_PLAYA,
  MEGAPHONE,
  MENTOR,
  TIMESHEET_MANAGEMENT,
  TRAINER,
  TRAINER_SEASONAL,
  VC,
];

export default class AdminTeamsController extends ClubhouseController {
  @tracked teams;
  @tracked roles;
  @tracked roleById;
  @tracked entry = null;

  typeOptions = [
    ['Team', TYPE_TEAM],
    ['Cadre', TYPE_CADRE],
    ['Delegation', TYPE_DELEGATION]
  ];

  typeLabel(type) {
    return TypeLabels[type] ?? type;
  }

  @action
  roleList(roleIds) {
    if (!roleIds?.length) {
      return '-';
    }

    const roles = roleIds.map((id) => this.roleById[id].title ?? `Role #${id}`);
    roles.sort();
    return htmlSafe(roles.join('<br>'));
  }

  get canManageTeams() {
    return this.session.hasRole(TECH_NINJA);
  }

  get roleOptions() {
    const options = [];

    ALLOWED_ROLES.forEach((roleId) => {
      const role = this.roles.find((r) => +r.id === roleId);
      if (role) {
        options.push({id: roleId, title: role.title});
      }
    })

    return options;
  }

  @action
  newTeam() {
    this.entry = this.store.createRecord('team');
  }

  @action
  editTeam(team) {
    this.entry = team;
  }

  @action
  removeTeam() {
    this.modal.confirm('Delete Team', `Are you sure you wish to delete "${this.entry.title}"? This operation cannot be undone.`, () => {
      this.entry.destroyRecord().then(() => {
        this.toast.success('The team has been deleted.');
        this.entry = null;
      }).catch((response) => this.house.handleErrorResponse(response));
    })
  }

  @action
  saveTeam(model, isValid) {
    if (!isValid) {
      return;
    }

    this.house.saveModel(model, `The team has been ${model.isNew ? 'created' : 'updated'}.`, () => {
      this.teams.update();
      this.entry = null;
    });
  }

  @action
  cancelTeam() {
    this.entry = null;
  }
}
