import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {TEAM_CATEGORY_ALL_MEMBERS, TEAM_CATEGORY_PUBLIC} from 'clubhouse/models/position';

export default class PersonMembershipController extends ClubhouseController {
  @tracked person;
  @tracked teams;
  @tracked generalPositions;
  @tracked canManageGeneralPositions = false;
  @tracked isSaving = false;

  get isAdmin() {
    return this.session.isAdmin;
  }

  get teamsScrollList() {
    return this.teams.map((t) => ({id: `team-box-${t.id}`, title: t.title}));
  }

  @action
  positionClick(position, event) {
    if (position.selected || !position.hasDangerousPermissions) {
      position.selected = !position.selected;
      return;
    }

    this._confirmDangerousGrant(event, position, 'position', () => {
      position.selected = true;
    });
  }

  @action
  teamClick(team, event) {
    if (team.selected || !team.hasDangerousPermissions) {
      this._performTeamClick(team);
      return;
    }

    this._confirmDangerousGrant(event, team, 'Clubhouse Team', () => {
      this._performTeamClick(team);
    });
  }

  _performTeamClick(team) {
    team.selected = !team.selected;
    if (team.selected) {
      team.allMembers.forEach((p) => {
        if (p.team_category === TEAM_CATEGORY_ALL_MEMBERS) {
          p.selected = team.selected;
        }
      });
      this._deselectRecommendation(team.allRangers);
      this._deselectRecommendation(team.optional);
      this._deselectRecommendation(team.allMembers);
    } else {
      team.allMembers.forEach((p) => {
        if (p.team_category !== TEAM_CATEGORY_PUBLIC) {
          p.selected = false;
        }
      });
    }
  }

  _confirmDangerousGrant(event, entity, title, callback) {
    const target = event.target;
    target.checked = false;
    this.modal.confirm('Confirm grant with dangerous permissions associated.',
      `<p>The ${title} <i>${entity.title}</i> has the permission(s) ${entity.hasDangerousPermissions} associated. Normally, such permission grants require approval from Council and the Tech Team first.</p>Are you sure you want to do this?`,
      () => {
        target.checked = true;
        callback();
      });
  }


  /**
   * Deselect those positions recommended to be removed when a person joins a team.
   * E.g., mentee positions
   *
   * @param positions
   * @private
   */

  _deselectRecommendation(positions) {
    positions.forEach((p) => {
      if (p.deselect_on_team_join) {
        p.selected = false;
      }
    });
  }

  @action
  toggleRolesAction(item) {
    item.showRoles = !item.showRoles;
  }

  @action
  managerClick(team, event) {
    const isChecked = !team.managerSelect.selected;
    if (team.type === 'team' || !isChecked) {
      team.managerSelect.selected = isChecked;
      return;
    }

    const target = event.target;
    target.checked = false;
    this.modal.confirm('Confirm Clubhouse Team Manager Assignment',
      `<p>The Clubhouse Team <i>${team.title}</i> is a <b>${team.type}</b>.</p><p>It is recommended cadre / delegation members are NOT assigned as Clubhouse Managers for their cadre/delegation, only their team. Otherwise, they may be given the ability to mint new cadre/delegation members without approval from Council first, and unintentional privilege escalation may result.</p>Are you sure you want to do this?`,
      () => {
        team.managerSelect.selected = true;
        target.checked = true;
      });
  }

  @action
  async saveAction() {
    const position_ids = [], manager_ids = [], team_ids = [];

    this.teams.forEach((team) => {
      if (team.selected) {
        team_ids.push(team.id);
      }

      if (team.managerSelect.selected) {
        manager_ids.push(team.id);
      }

      this._buildSelected(team.allMembers, position_ids);
      this._buildSelected(team.optional, position_ids);
      this._buildSelected(team.allRangers, position_ids);
    });

    this._buildSelected(this.generalPositions, position_ids);

    this.isSaving = true;
    try {
      const personId = this.person.id;

      await this.ajax.post(`person/${personId}/positions`, {data: {position_ids}});
      await this.ajax.post(`person/${personId}/teams`, {data: {team_ids, manager_ids}});

      this.toast.success('Teams and/or positions successfully updated.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Build up the selected position ids
   *
   * @param positions
   * @param ids
   * @private
   */

  _buildSelected(positions, ids) {
    positions.forEach((p) => {
      if (p.selected) {
        ids.push(p.id);
      }
    });
  }
}
