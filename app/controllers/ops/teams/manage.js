import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';

export default class OpsTeamsManageController extends ClubhouseController {
  @tracked isSubmitting = false;
  @tracked allMembersPositions;
  @tracked optionalPositions;
  @tracked publicPositions;
  @tracked people;
  @tracked team;

  @tracked viewFilter = 'all';

  @tracked showPerson = null;

  viewFilterOptions = [
    ['Show All', 'all'],
    ['Never Worked Any Recommended and Optional Positions', 'never-all'],
    ['Never Worked Any Recommended Positions', 'never-recommended'],
    ['Never Worked Any Optional Positions', 'never-optional'],
  ];

  @action
  revokeMembership(person) {
    this.modal.confirm('Confirm Team Removal',
      `In addition the person being removed from the team, all recommended, and optional positions will be revoked. Any granted public positions, if any, will be left untouched. Are you sure want to remove ${person.callsign} from the team?`,
      async () => {
        try {
          await this.ajax.post(`person/${person.id}/positions`,
            {
              data: {revoke_ids: [...this.allMembersPositions.map((p) => p.id), ...this.optionalPositions.map((p) => p.id)]}
            });
          await this.ajax.post(`person/${person.id}/teams`, {data: {revoke_ids: [this.team.id]}});
          person.revoked = true;
          this.toast.success(`${person.callsign} was successfully removed`);
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }

  @cached
  get viewPeople() {
    switch (this.viewFilter) {
      case 'never-all':
        return this.people.filter((person) =>
          !this.allMembersPositions.find((p) => person.positions.find((grant) => (grant.id === p.id && grant.worked_on)))
          && !this.optionalPositions.find((p) => person.positions.find((grant) => (grant.id === p.id && grant.worked_on)))
        );
      case 'never-recommended':
        return this.people.filter((person) => !this.allMembersPositions.find((p) => person.positions.find((grant) => (grant.id === p.id && grant.worked_on))));
      case 'never-optional':
        return this.people.filter((person) => !this.optionalPositions.find((p) => person.positions.find((grant) => (grant.id === p.id && grant.worked_on))));
      default:
        return this.people;
    }
  }

  @action
  selectAll() {
    this.viewPeople.forEach((p) => p.selected = true);
  }

  @action
  deselectAll() {
    this.viewPeople.forEach((p) => p.selected = false);
  }

  get selectedPeople() {
    return this.viewPeople.filter((p) => p.selected);
  }

  @action
  revokeSelected() {
    const people = this.selectedPeople;
    if (!people.length) {
      this.modal.info(null, 'No accounts are selected.');
      return;
    }

    this.modal.confirm('Confirm Bulk Revocation',
      `You are about to bulk remove the team membership, revoke recommended and optional positions (public positions will be untouched) from ${people.length} account(s). Are you sure you want to do this?`,
      () => this._bulkRevoke());
  }

  async _bulkRevoke() {
    const people = this.selectedPeople;
    const revoke_ids = [...this.allMembersPositions.map((p) => p.id), ...this.optionalPositions.map((p) => p.id)];
    try {
      for (let i = 0; i < people.length; i++) {
        const person = people[i];
        this.showPerson = person;
        await this.ajax.post(`person/${person.id}/positions`, {data: {revoke_ids}});
        await this.ajax.post(`person/${person.id}/teams`, {data: {revoke_ids: [this.team.id]}});
        person.revoked = true;
        person.selected = false;
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.showPerson = null;
    }
  }
}
