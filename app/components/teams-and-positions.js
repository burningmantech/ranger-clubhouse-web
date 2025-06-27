import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';

export default class TeamsAndPositions extends Component {
  get hasNoTeamOrPositions() {
    const {membership} = this.args;

    return (!membership.positions.length && !membership.teams.length);
  }

  @cached
  get teamMembership() {
    const {membership} = this.args;
    const {teams} = membership;

    teams.forEach((t) => t.is_member = true);

    membership.management.forEach((m) => {
      const team = teams.find((t) => t.id === m.id)
      if (team) {
        team.is_manager = true;
      }
    })

    return teams;
  }

  @cached
  get positions() {
    const {membership} = this.args;
    const {positions} =membership;
    const teamsById = membership.teams.reduce((hash, team) => {
      hash[team.id] = team;
      return hash
    }, {});
    const teamPositions = {};
    const generalPositions = [];

    membership.not_member_teams.forEach((t) => {teamsById[t.id] = t;})

    positions.forEach((p) => {
      if (p.team_id) {
        if (!teamPositions[p.team_id]) {
          teamPositions[p.team_id] = {title: teamsById[p.team_id].title, positions: []};
        }
        teamPositions[p.team_id].positions.push(p);
      } else {
        generalPositions.push(p);
      }
    });

    const teams = Object.keys(teamPositions).map(id => teamPositions[id]);
    teams.sort((a, b) => a.title.localeCompare(b.title));

    return {
      generalPositions,
      teams
    }
  }


}
