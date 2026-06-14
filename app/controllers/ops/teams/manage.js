import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {buildGroupedPositions} from "clubhouse/utils/position-grouping";

// Single source of truth for the view-filter keys (used by the <select>
// options and the viewPeople switch). Prevents silent fall-through typos.
export const VIEW_FILTER = {
  ALL: 'all',
  NEVER_ALL: 'never-all',
  NEVER_RECOMMENDED: 'never-recommended',
  NEVER_OPTIONAL: 'never-optional',
};

export default class OpsTeamsManageController extends ClubhouseController {
  @tracked allMembersPositions;
  @tracked optionalPositions;
  @tracked publicPositions;
  @tracked people;
  @tracked team;

  @tracked viewFilter = VIEW_FILTER.ALL;

  // Drives the LoadingDialog. Set to the person currently being processed by a
  // revoke operation; null when idle.
  @tracked showPerson = null;

  viewFilterOptions = [
    ['Show All', VIEW_FILTER.ALL],
    ['Never Worked Any Recommended and Optional Positions', VIEW_FILTER.NEVER_ALL],
    ['Never Worked Any Recommended Positions', VIEW_FILTER.NEVER_RECOMMENDED],
    ['Never Worked Any Optional Positions', VIEW_FILTER.NEVER_OPTIONAL],
  ];

  // The recommended + optional position ids stripped on team removal. Public
  // positions are intentionally excluded.
  get nonPublicPositionIds() {
    return [
      ...this.allMembersPositions.map((p) => p.id),
      ...this.optionalPositions.map((p) => p.id),
    ];
  }

  @cached
  get allPositions() {
    return buildGroupedPositions(
      this.allMembersPositions,
      this.optionalPositions,
      this.publicPositions,
    );
  }

  // True when `person` has worked (worked_on) at least one of `positions`.
  hasWorkedPositionIn(person, positions) {
    return positions.some((p) =>
      person.positions.some((grant) => grant.id === p.id && grant.worked_on)
    );
  }

  @cached
  get viewPeople() {
    switch (this.viewFilter) {
      case VIEW_FILTER.NEVER_ALL:
        return this.people.filter((person) =>
          !this.hasWorkedPositionIn(person, this.allMembersPositions)
          && !this.hasWorkedPositionIn(person, this.optionalPositions)
        );
      case VIEW_FILTER.NEVER_RECOMMENDED:
        return this.people.filter((person) =>
          !this.hasWorkedPositionIn(person, this.allMembersPositions));
      case VIEW_FILTER.NEVER_OPTIONAL:
        return this.people.filter((person) =>
          !this.hasWorkedPositionIn(person, this.optionalPositions));
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

  // Revoke one person's team membership and recommended/optional positions.
  //
  // NOTE: this is two sequential, non-atomic POSTs. The API does not expose a
  // transactional endpoint, so a failure between them can leave positions
  // revoked while team membership persists. Re-running the revoke is safe
  // (idempotent). True atomicity requires an API change — tracked separately.
  @action
  revokeMembership(person) {
    this.modal.confirm('Confirm Team Removal',
      `In addition the person being removed from the team, all recommended, and optional positions will be revoked. Any granted public positions, if any, will be left untouched. Are you sure want to remove ${person.callsign} from the team?`,
      async () => {
        this.showPerson = person;
        try {
          await this._revokePerson(person);
          person.revoked = true;
          person.selected = false;
          this.toast.success(`${person.callsign} was successfully removed`);
        } catch (response) {
          this.errors.handleErrorResponse(response);
        } finally {
          this.showPerson = null;
        }
      });
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

  // Issues the two revoke POSTs for a single person.
  async _revokePerson(person) {
    await this.ajax.post(`person/${person.id}/positions`,
      {data: {revoke_ids: this.nonPublicPositionIds}});
    await this.ajax.post(`person/${person.id}/teams`,
      {data: {revoke_ids: [this.team.id]}});
  }

  // Bulk revoke. Unlike a single try/catch around the loop, a failure on one
  // person no longer aborts the whole batch: remaining people are still
  // processed, and the operator is told exactly which callsigns failed.
  // Successfully-revoked people are marked revoked and deselected; failed
  // people stay selected so the operator can retry them.
  async _bulkRevoke() {
    const people = this.selectedPeople;
    const failures = [];
    let lastError = null;

    for (const person of people) {
      this.showPerson = person;
      try {
        await this._revokePerson(person);
        person.revoked = true;
        person.selected = false;
      } catch (response) {
        failures.push(person);
        lastError = lastError ?? response;
      }
    }

    this.showPerson = null;

    if (failures.length === 0) {
      this.toast.success(`${people.length} account(s) were successfully removed`);
      return;
    }

    const callsigns = failures.map((p) => p.callsign).join(', ');
    this.toast.error(`Failed to revoke ${failures.length} account(s): ${callsigns}`);
    this.errors.handleErrorResponse(lastError);
  }
}
