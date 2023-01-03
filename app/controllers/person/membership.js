import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class PersonMembershipController extends ClubhouseController {
  @tracked person;
  @tracked teams;
  @tracked generalPositions;
  @tracked canManageGeneralPositions = false;
  @tracked isSaving = false;

  @action
  itemClick(item) {
    item.selected = !item.selected;
  }

  @action
  teamClick(team) {
    team.selected = !team.selected;
    if (team.selected) {
      team.allMembers.forEach((p) => {
        if (p.all_team_members) {
          p.selected = team.selected;
        }
      });
    } else {
      team.allMembers.forEach((p) => {
        if (!p.public_team_position) {
          p.selected = false;
        }
      });
    }
  }

  @action
  toggleRolesAction(item) {
    item.showRoles = !item.showRoles;
  }

  @action
  managerClick(team) {
    team.managerSelect.selected = !team.managerSelect.selected;
  }

  @action
  async saveAction() {
    const position_ids = [], manager_ids = [], team_ids = [];

    this.teams.forEach((team) => {
      if (team.selected) {
        team_ids.push(team.id);
        if (team.managerSelect.selected) {
          manager_ids.push(team.id);
        }
      }

      team.allMembers.forEach((p) => {
        if (p.selected) {
          position_ids.push(p.id);
        }
      });

      team.optional.forEach((p) => {
        if (p.selected) {
          position_ids.push(p.id);
        }
      });
      team.allRangers.forEach((p) => {
        if (p.selected) {
          position_ids.push(p.id);
        }
      });

    });

    this.generalPositions.forEach((p) => {
      if (p.selected) {
        position_ids.push(p.id);
      }
    })

    this.isSaving = true;
    try {
      const personId = this.person.id;

      await this.ajax.request(`person/${personId}/positions`, {
        method: 'POST',
        data: {position_ids}
      });

      await this.ajax.request(`person/${personId}/teams`, {
        method: 'POST',
        data: {team_ids, manager_ids}
      });

      this.toast.success('Teams and/or positions successfully updated.');
      this.router.transitionTo('person.index', this.person.id);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSaving = false;
    }
  }
}
