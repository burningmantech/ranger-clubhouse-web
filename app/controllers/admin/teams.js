import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {TECH_NINJA} from 'clubhouse/constants/roles';
import {TypeLabels, TYPE_CADRE, TYPE_TEAM, TYPE_DELEGATION} from 'clubhouse/models/team';
import {htmlSafe} from '@ember/template';

export default class AdminTeamsController extends ClubhouseController {
  @tracked teams;
  @tracked roles;
  @tracked roleById;
  @tracked entry = null;
  @tracked roleOptions;
  @tracked activeFilter = 'all';
  @tracked mvrEligibilityFilter = 'all';

  activeOptions = [
    {id: 'all', title: 'All'},
    {id: 'active', title: 'Active'},
    {id: 'inactive', title: 'Inactive'},
  ];

  mvrEligibleOptions = [
    {id: 'all', title: 'All'},
    {id: 'eligible', title: 'Eligible'},
    {id: 'ineligible', title: 'Ineligible'},
  ];

  typeOptions = [
    ['Team', TYPE_TEAM],
    ['Cadre', TYPE_CADRE],
    ['Delegation', TYPE_DELEGATION]
  ];

  typeLabel(type) {
    return TypeLabels[type] ?? type;
  }

  @cached
  get viewTeams() {
    let teams = this.teams;
    switch (this.activeFilter) {
      case 'active':
        teams = teams.filter((t) => t.active);
        break;
      case 'inactive':
        teams = teams.filter((t) => !t.active);
      break;
    }

    switch (this.mvrEligibilityFilter) {
      case 'eligible':
        teams = teams.filter((t) => t.mvr_eligible);
        break;
      case 'ineligible':
        teams = teams.filter((t) => !t.mvr_eligible);
        break;
    }

    return teams;
  }
  @cached
  get teamScrollList() {
    return this.teams.map((t) => ({id: `team-${t.id}`, title: t.title}));
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
    this.modal.confirm('Delete Team',
      `Are you sure you wish to delete "${this.entry.title}"? This operation cannot be undone.`, async () => {
        try {
          await this.entry.destroyRecord();
          this.toast.success('The team has been deleted.');
          this.entry = null;
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      });
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
