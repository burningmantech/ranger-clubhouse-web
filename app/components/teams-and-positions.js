import Component from '@glimmer/component';
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

const UNKNOWN_TEAM_TITLE = 'Unknown Team';

export default class TeamsAndPositions extends Component {
  @tracked showTeamDocument;

  // Single source of truth for team-by-id lookups. Includes not_member_teams so
  // that team-scoped positions can resolve a title even for teams the person
  // isn't a member of. Shared by both derived getters below.
  @cached
  get teamsById() {
    const {teams, not_member_teams} = this.args.membership;

    return new Map(
      [...teams, ...not_member_teams].map((team) => [team.id, team])
    );
  }

  // Derived view-model: plain objects, no mutation of the source models.
  @cached
  get teamMembership() {
    const {teams, management} = this.args.membership;
    const managerIds = new Set(management.map((m) => m.id));

    return teams.map((team) => ({
      title: team.title,
      document_tag: team.document_tag,
      document_body: team.document_body,
      is_manager: managerIds.has(team.id),
    }));
  }

  @cached
  get positions() {
    const {positions} = this.args.membership;
    const {teamsById} = this;

    const generalPositions = [];
    const groupsByTeamId = new Map();

    positions.forEach((position) => {
      if (!position.team_id) {
        generalPositions.push(position);
        return;
      }

      let group = groupsByTeamId.get(position.team_id);
      if (!group) {
        const team = teamsById.get(position.team_id);
        group = {title: team?.title ?? UNKNOWN_TEAM_TITLE, positions: []};
        groupsByTeamId.set(position.team_id, group);
      }
      group.positions.push(position);
    });

    const teamGroups = [...groupsByTeamId.values()].sort((a, b) =>
      (a.title || '').localeCompare(b.title || '')
    );

    return {generalPositions, teamGroups};
  }

  @action
  viewTeanDocument(team) {
    this.showTeamDocument = team;
  }

  @action
  closeTeamDocument() {
    this.showTeamDocument = null;
  }
}
