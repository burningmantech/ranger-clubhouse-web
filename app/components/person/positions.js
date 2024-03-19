import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';

export default class PersonPositionsComponent extends Component {
   get hasNoPositions() {
    const membership = this.args.personMembership;

    return (!membership.positions.length && !membership.teams.length);
  }

  @cached
  get membership() {
    const membership = this.args.personMembership;

    const teams = [...membership.teams, ...membership.not_member_teams];
    const unassignedPositions = [];

    membership.not_member_teams.forEach((t) => t.is_member = false);
    membership.teams.forEach((t) => t.is_member = true);

    const teamsById = teams.reduce((hash, team) => {
      hash[team.id] = team;
      return hash;
    }, {});

    membership.positions.forEach((p) => {
      if (!p.team_id) {
        unassignedPositions.push(p);
        return;
      }

      const team = teamsById[p.team_id];
      if (team) {
        (team.positions ??= []).push(p);
      } else {
        unassignedPositions.push(p);
      }
    });

    membership.management.forEach((m) => {
      if (teamsById[m.id]) {
        teamsById[m.id].is_manager = true;
      }
    });


    teams.sort((a, b) => a.title.localeCompare(b.title));

    return {teams, unassignedPositions};
  }
}
