import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {
  TEAM_CATEGORY_ALL_MEMBERS,
  TEAM_CATEGORY_OPTIONAL,
  TEAM_CATEGORY_PUBLIC,
} from "clubhouse/models/position";
import {VIEW_FILTER} from "clubhouse/controllers/ops/teams/manage";
import {tracked} from '@glimmer/tracking';
import Selectable from "clubhouse/utils/selectable";

/**
 * A team roster row. Wraps a raw person record (id, callsign, status,
 * is_member, positions[]) from the membership endpoint and adds the tracked
 * `selected` flag (via Selectable) plus a tracked `revoked` flag.
 */
class TeamMember extends Selectable {
  @tracked revoked = false;

  constructor(person) {
    super(person);
  }
}

export default class OpsTeamsManageRoute extends ClubhouseRoute {
  async model({team_id}) {
    return {
      team: (await this.ajax.request(`team/${team_id}`)).team,
      membership: await this.ajax.request(`team/${team_id}/membership`),
    };
  }

  setupController(controller, {team, membership: {people, positions}}) {
    controller.team = team;
    controller.allMembersPositions = positions.filter((p) => p.team_category === TEAM_CATEGORY_ALL_MEMBERS);
    controller.optionalPositions = positions.filter((p) => p.team_category === TEAM_CATEGORY_OPTIONAL);
    controller.publicPositions = positions.filter((p) => p.team_category === TEAM_CATEGORY_PUBLIC);
    controller.people = people.map((p) => new TeamMember(p));
    controller.viewFilter = VIEW_FILTER.ALL;
  }
}
